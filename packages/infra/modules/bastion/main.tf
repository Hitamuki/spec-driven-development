# Bastion Host (EC2 Instance)
resource "aws_instance" "bastion" {
  ami           = var.ami_id
  instance_type = var.instance_type

  # Must be in a public subnet to be accessible from internet
  subnet_id                   = var.public_subnet_id
  vpc_security_group_ids      = [var.bastion_security_group_id]
  associate_public_ip_address = true

  key_name = var.key_name != "" ? var.key_name : null

  tags = {
    Name = "${var.project_name}-bastion"
  }
}

resource "aws_ec2_instance_state" "bastion" {
  instance_id = aws_instance.bastion.id
  state       = var.instance_desired_state
}
