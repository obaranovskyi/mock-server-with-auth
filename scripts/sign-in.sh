sign_in() {
  read -p "Enter username: " username
  read -p "Enter password: " password

  user=$(curl -s -X POST http://localhost:3000/sign-in                  \
    -H 'Content-Type: application/json'                                 \
    -d "{ \"username\": \"$username\", \"password\": \"$password\" }")

  echo $user
}

sign_in

