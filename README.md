# Description
Alexa Skill Project for an Electronics Repair Service. The language used was JavaScript. The chosen database was DynamoDB, a NoSQL key-value database.

## Skills
![image](https://github.com/user-attachments/assets/235d9714-a3b4-4e68-b770-ff4860b13d46)

### 1º Skill - CadastrarProdutoIntent
This skill allows the registration of the product name, ID, status, registration date, price, customer name, and customer phone number.

### 2º Skill - ConsultarProdutoIntent
This skill allows viewing product details by providing the respective ID.

### 3º Skill - RemoverProdutoIntent
This skill allows deleting a product by providing the respective ID.

### 4º Skill - AlterarStatusProdutoIntent
The skill allows updating the product status by providing the respective ID. Possible status options are "Open", "Under Repair" and "Completed".

### 5º Skill - EnviarZapIntent
This skill integrates with an API that, by providing an ID, sends a message to the customer's phone to notify them of the repair completion.

<br>

> [!CAUTION]
> Except for the 'CadastrarProdutoIntent' skill, the other skills include handling cases where the product has not been created or found in the database.

