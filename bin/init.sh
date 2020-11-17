!#/bin/bash
# CentOS,
if [ -f /etc/redhat-release ]; then
  yum update -y

  # install MongoDB
  yum install mongodb-org
  sudo systemctl start mongod
  sudo systemctl enable mongod

  # install NodeJs 12.x
  curl -sL https://rpm.nodesource.com/setup_12.x | bash -

  yum install zsh git redis
  sh -c "$(curl -fsSL https://raw.github.com/robbyrussell/oh-my-zsh/master/tools/install.sh)"

fi
# Ubuntu,
if [ -f /etc/lsb-release ]; then
  apt-get update
  apt-get upgrade -y

  # install MongoDB
  wget -qO - https://www.mongodb.org/static/pgp/server-4.0.asc | sudo apt-key add -
  echo "deb [ arch=amd64 ] https://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/4.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.0.list
  sudo apt update
  sudo apt install -y mongodb-org

  mkdir /data
  mkdir /data/db
  sudo service mongod start
  sudo service enable mongodb

  # install NodeJs 12.x
  curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
  sudo apt-get install -y nodejs

  apt install zsh git redis-server
  sh -c "$(curl -fsSL https://raw.github.com/robbyrussell/oh-my-zsh/master/tools/install.sh)"
  
fi