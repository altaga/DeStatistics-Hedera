# Tutorial

This is a short guide to demonstrate how to use the web platform.

## Connect Wallet:

First, we will need to have a wallet like Metamask already installed in the browser.

<img src="./images/wallet1.png" width="50%">

You will need to press the **Connect** button in the top right corner.

<img src="./images/wallet2.png" width="50%">

This will open a Modal asking us what type of wallet we want to use. We recommend using the wallet connection.

<img src="./images/wallet3.png" width="60%">

The drop-down list of all the wallets that allow connection will open, in this case we will select **Metamask**.

<img src="./images/wallet4.png" width="80%">

This will open the wallet and execute the following commands.

<img src="./images/wallet5.png" width="100%">

- Connect: This command connects the wallet to the DApp.
- Add Hedera (only Once): If the Hedera network is not added to the wallet, it is added to be compatible with the DApp.
- Sign In: The site performs a sign-in to ensure that the wallet interacting with the DApp is the correct one and not a fake one.

## Interact with Databases.

Open any of the databases on the main page or search for one of your interest in the search bar.

<img src="./images/interaction1.png" width="100%">

When you open any of the databases, you will see a window like this, which we will explain in detail.

<img src="./images/interaction2.png" width="80%">

1. Go to version control.
2. Select the version you want to view.
3. Select the country you want to view data for.
4. Attach the database to the query you make in the wizard.

The window is very simple, just type the query you want to make and it will answer you as best it can, if you want to see how it works technically. [CLICK HERE](./README.md#ai-extra-tools)

<img src="./images/interaction3.png" width="50%">

Type the query in the window in the text space, pressing **Enter** or pressing the send arrow, the message will be sent, for now a signature is requested to make the queries, however eventually we will charge 1 cent of hbar per query.

<img src="./images/chat2.png" width="50%">

Finally the agent will provide us with the answer to the query.

<img src="./images/chat3.png" width="50%">

The uploader window provides information about the user who uploaded the dataset, the queries that have been made to it, and an interface for making donations.

<img src="./images/interaction4.png" width="100%">

1. Username.
2. User address on Hedera Mainnet.
3. Number of requests made on the database.
4. Amount in Hbar the user has received as donations from the database.
5. Amount the user wishes to donate to the database.
6. Button to make a donation to the user.

## Version Control:

In the case of the version control screen, it allows us to see the differences between each of the database versions, in order to ensure that the data verified by the AI ​​was correctly accepted into the platform.

<img src="./images/versions1.png" width="100%">

In the lower section of the databases you can see all the changes that have occurred from one database to another.

<img src="./images/versions2.png" width="100%">

## Upload:

Uploading a new database to the platform is a 100% automated process. We'll show you how to do it.

1. Press the Upload button to the right of the Disconnect button.

<img src="./images/uploads1.png" width="100%">

2. Once on the next screen we will select whether it is a new version of an existing database or a completely new database.

<img src="./images/uploads2.png" width="100%">

3. Depending on the case, you'll need to fill in the Title, Description, and Source fields. Finally, add the file containing the Database to the Choose File field. In this repository, we've provided an example of a properly formatted database ready for upload. [CLICK HERE](./example-db/Taxes%20on%20exports.csv)

<img src="./images/uploads3.png" width="100%">

4. Finally, when you press Upload and Verify, you'll only have to wait a little less than a minute to see the result.

<img src="./images/upload3.png" width="100%">

5. If all goes well and the database is accepted, and you can view it on our platform ready to use, you will receive a number of DES tokens on Mainnet.

<img src="./images/uploads4.png" width="50%">
