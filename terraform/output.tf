output "cluster_id" {
  value = aws_eks_cluster.fendimohamed.id
}

output "node_group_id" {
  value = aws_eks_node_group.fendimohamed.id
}

output "vpc_id" {
  value = aws_vpc.fendimohamed_vpc.id
}

output "subnet_ids" {
  value = aws_subnet.fendimohamed_subnet[*].id
}