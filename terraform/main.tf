provider "aws" {
  region = "us-west-2"
}

resource "aws_vpc" "fendimohamed_vpc" {
  cidr_block = "10.0.0.0/16"

  tags = {
    Name = "fendimohamed-vpc"
  }
}

resource "aws_subnet" "fendimohamed_subnet" {
  count = 2
  vpc_id                  = aws_vpc.fendimohamed_vpc.id
  cidr_block              = cidrsubnet(aws_vpc.fendimohamed_vpc.cidr_block, 8, count.index)
  availability_zone       = element(["us-west-2a", "us-west-2b"], count.index)
  map_public_ip_on_launch = true

  tags = {
    Name = "fendimohamed-subnet-${count.index}"
  }
}

resource "aws_internet_gateway" "fendimohamed_igw" {
  vpc_id = aws_vpc.fendimohamed_vpc.id

  tags = {
    Name = "fendimohamed-igw"
  }
}

resource "aws_route_table" "fendimohamed_route_table" {
  vpc_id = aws_vpc.fendimohamed_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.fendimohamed_igw.id
  }

  tags = {
    Name = "fendimohamed-route-table"
  }
}

resource "aws_route_table_association" "fendimohamed_association" {
  count          = 2
  subnet_id      = aws_subnet.fendimohamed_subnet[count.index].id
  route_table_id = aws_route_table.fendimohamed_route_table.id
}

resource "aws_security_group" "fendimohamed_cluster_sg" {
  vpc_id = aws_vpc.fendimohamed_vpc.id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "fendimohamed-cluster-sg"
  }
}

resource "aws_security_group" "fendimohamed_node_sg" {
  vpc_id = aws_vpc.fendimohamed_vpc.id

  ingress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "fendimohamed-node-sg"
  }
}

resource "aws_eks_cluster" "fendimohamed" {
  name     = "fendimohamed-cluster"
  role_arn = aws_iam_role.fendimohamed_cluster_role.arn

  vpc_config {
    subnet_ids         = aws_subnet.fendimohamed_subnet[*].id
    security_group_ids = [aws_security_group.fendimohamed_cluster_sg.id]
  }
}


resource "aws_eks_addon" "ebs_csi_driver" {
  cluster_name    = aws_eks_cluster.fendimohamed.name
  addon_name      = "aws-ebs-csi-driver"
  
  resolve_conflicts_on_create = "OVERWRITE"
  resolve_conflicts_on_update = "OVERWRITE"
}


resource "aws_eks_node_group" "fendimohamed" {
  cluster_name    = aws_eks_cluster.fendimohamed.name
  node_group_name = "fendimohamed-node-group"
  node_role_arn   = aws_iam_role.fendimohamed_node_group_role.arn
  subnet_ids      = aws_subnet.fendimohamed_subnet[*].id

  scaling_config {
    desired_size = 3
    max_size     = 3
    min_size     = 3
  }

  instance_types = ["t2.medium"]

  remote_access {
    ec2_ssh_key = var.ssh_key_name
    source_security_group_ids = [aws_security_group.fendimohamed_node_sg.id]
  }
}

resource "aws_iam_role" "fendimohamed_cluster_role" {
  name = "fendimohamed-cluster-role"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "eks.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "fendimohamed_cluster_role_policy" {
  role       = aws_iam_role.fendimohamed_cluster_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
}

resource "aws_iam_role" "fendimohamed_node_group_role" {
  name = "fendimohamed-node-group-role"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "fendimohamed_node_group_role_policy" {
  role       = aws_iam_role.fendimohamed_node_group_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
}

resource "aws_iam_role_policy_attachment" "fendimohamed_node_group_cni_policy" {
  role       = aws_iam_role.fendimohamed_node_group_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
}

resource "aws_iam_role_policy_attachment" "fendimohamed_node_group_registry_policy" {
  role       = aws_iam_role.fendimohamed_node_group_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

resource "aws_iam_role_policy_attachment" "fendimohamed_node_group_ebs_policy" {
  role       = aws_iam_role.fendimohamed_node_group_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy"
}