create_user() {
  read -p "Enter username: " username
  read -p "Enter password: " password

  user=$(curl -s -X POST http://localhost:3000/users        \
    -H 'Content-Type: application/json'                     \
    -d "{ \"username\": \"$username\", \"password\": \"$password\" }")

  echo "User created:" $user
}

create_user

while true;
do
    read -r -p "Do you want to add one more user? y/n " response   
    if [[ $response =~ ^([yY][eE][sS]|[yY])$ || -z $response ]]
    then
      create_user
    else
      break
    fi
done

