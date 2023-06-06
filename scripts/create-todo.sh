read -p "Enter user id: " user_id
read -p "Enter token: " token

create_todo() {
  read -p "Enter description: " description

  todo=$(curl -s -X POST http://localhost:3000/todos                        \
    -H 'Content-Type: application/json'                                     \
    -H "authorization: Bearer $token"                                                      \
    -d "{ \"description\": \"$description\", \"userId\": $user_id }")

  echo "Todo created:" $todo
}

create_todo

while true;
do
    read -r -p "Do you want to add one more todo? y/n " response   
    if [[ $response =~ ^([yY][eE][sS]|[yY])$ || -z $response ]]
    then
      create_todo
    else
      break
    fi
done
