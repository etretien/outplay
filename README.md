# Outplay

Outplay is the first application for amateur athletes that allows you to receive cash rewards for playing the sport you like. You also can find partners and track your progress in your favorite sport in the app. Build your own sports community and receive extra rewards for having around you the people who share the same passion as you.

# Current implementation (Minima Innovation Challenge, Phase 2)

## User registration
The user creates a profile, indicating basic information about himself: first name, last name, email, country, password to enter the application.

## User profile
The profile contains information about the user specified during registration. You can also add information “about yourself” and your game level. The profile displays the player's automatically calculated rating and his earned tokens. The demo version implements the function of challenging users to play and adding the result. 
Implementation plan: adding group competitions, as well as the display of NFTs that affect rewards for winning the challenges and competitions. The competition should be held by a user with a special role. To participate in the competition, all players contribute the amount of x application tokens.

## Challenges
User A challenges User B to a game. If User B accepts the challenge, both A and B are locked out of an equal amount of x App tokens (Outplay) until the result of the game is added to the App. Thus, the prize fund of the challenge is equal to 2x Application tokens. After adding the result, the winner receives the entire prize fund of the game (2x Outplay).

## Player rating
Player rating is available to all users. It is also possible to search by the list of players.

## Future Implementation: Marketplace for the NFTs
Players can purchase NFTs from the in-app market. NFTs should be in the form of various tennis-related products. NFTs allow users to receive bonuses when participating in activities within the application itself and within other project related activities (such as community activity in social media etc.).

## Future Implementation: Exchange of application tokens (Outplay) and Minima tokens
The user can exchange application tokens for Minima tokens and vice versa. He can send, receive, store the App tokens in his in-app wallet.

## Future Implementation: Fans
Players can invite to the application their relatives and friends who do not play tennis. Those users will receive the role of “fans”. They will also be able to receive rewards for using the app and supporting players, but will not have a game rating.

# Technical docs: variables and scripts for challenges

Operations with challenges are impossible without knowing the address and public key of the opponent. Scripts for challenges and challenge transactions actively use this data.

`OUTPLAY_TOKENID` - Outplay token identifier (environment variable)

`ADMIN_KEY` - admin public key for backend (environment variable)
`CHALLENGE_CREATOR_KEY` - public key of the user who creates the challenge
`CHALLENGE_CREATOR_ADDRESS` - challenge creator address
`OPPONENT_KEY` - public key of the user who is called for the challenge

`CHALLENGE_SCRIPT_ADDRESS` - challenge script address. Received at the time of creating or accepting the challenge
`CHALLENGE_WINNER_ADDRESS` - challenge winner address

## Create a challenge
1. Create a script. Command:
newscript script:"RETURN SIGNEDBY(ADMIN_KEY) OR (SIGNEDBY(CHALLENGE_CREATOR_KEY) AND SIGNEDBY(OPPONENT_KEY))" trackall:true

we get the script address from the response:
CHALLENGE_SCRIPT_ADDRESS = command.response.address;

2. Send 1 Outplay to the script address. Command:
send tokenid:OUTPLAY_TOKENID amount:1 address:CHALLENGE_SCRIPT_ADDRESS

## Accept a challenge
Exactly the same actions. Creating a script (exactly the same, note that OPPONENT_KEY in this case is your own public key). Get script address. Send 1 Outplay there.

## Normal end of a challenge
1. Get the coinid of the coins that are located at the address of the script. Command:
coins address:CHALLENGE_SCRIPT_ADDRESS

we get 2 coins from the response:
CHALLENGE_COIN_ID_1 = command.response[0].coinid;
CHALLENGE_COIN_ID_2 = command.response[1].coinid;

2. Create and sign a transaction. Commands (straight in a row):
txncreate id:finishchallenge
txnbasics id:finishchallenge
txninput id:finishchallenge coinid:CHALLENGE_COIN_ID_1  scriptmmr:true
txninput id:finishchallenge coinid:CHALLENGE_COIN_ID_2  scriptmmr:true
txnoutput id:finishchallenge address:CHALLENGE_WINNER_ADDRESS tokenid:OUTPLAY_TOKENID amount:2
txnsign id:finishchallenge publickey:USER_PUBLIC_KEY

3. Export a transaction for sending and signing by the second participant
txnexport id:finishchallenge

we get data from the response:
CHALLENGE_TX_DATA = command.response.data;

4. Somehow transfer this data (CHALLENGE_TX_DATA) to the second participant.

5. On the side of the second participant of the challenge, upload, sign and send the transaction. Commands (in order):
txnimport id:finishchallenge data:CHALLENGE_TX_DATA
txnsign id:finishchallenge publickey:USER_PUBLIC_KEY
txnpost id:finishchallenge

## Cancellation of a challenge (including by timeout), if the opponent did not accept 
It is more reasonable to do everything at once on the backend, because our signature is required.

1. Create a script (the backend node does not have it by default). Command:
newscript script:"RETURN SIGNEDBY(ADMIN_KEY) OR (SIGNEDBY(CHALLENGE_CREATOR_KEY) AND SIGNEDBY(OPPONENT_KEY))" trackall:true

from the response we get the script address:
CHALLENGE_SCRIPT_ADDRESS = command.response.address;

2. Get the coinid of a coin (one coin) that is located at the script address. Command
coins address:CHALLENGE_SCRIPT_ADDRESS

from the response we get 1 coin:
CHALLENGE_COIN_ID_1 = command.response[0].coinid;

3. Create, sign and send the transaction. Commands (consecutively):
txncreate id:cancelchallenge
txnbasics id:cancelchallenge
txninput id:cancelchallenge coinid:CHALLENGE_COIN_ID_1  scriptmmr:true
txnoutput id:cancelchallenge address:CHALLENGE_CREATOR_ADDRESS tokenid:OUTPLAY_TOKENID amount:1
txnsign id:cancelchallenge publickey:ADMIN_KEY
txnpost id:cancelchallenge

## Completion of the challenge if the second party does not sign
This is the general case for both when the other side simply slows down and for when the other side disagrees. How the latter will be resolved at the level of user-admin interaction is not important now. It is important that the CHALLENGE_WINNER_ADDRESS contains the address of the user to whom you need to transfer the Outplay tokens.

1. Create a script (the backend node does not have it by default). Command:
newscript script:"RETURN SIGNEDBY(ADMIN_KEY) OR (SIGNEDBY(CHALLENGE_CREATOR_KEY) AND SIGNEDBY(OPPONENT_KEY))" trackall:true

from the response we get the script address:
CHALLENGE_SCRIPT_ADDRESS = command.response.address;

2. Get the coinid of the coins that are located at the script address. Command:
coins address:CHALLENGE_SCRIPT_ADDRESS

from the response we get 1 coin:
CHALLENGE_COIN_ID_1 = command.response[0].coinid;
CHALLENGE_COIN_ID_2 = command.response[1].coinid;

3. Create, sign and send the transaction. Commands (consecutively):
txncreate id:finishchallenge
txnbasics id:finishchallenge
txninput id:finishchallenge coinid:CHALLENGE_COIN_ID_1  scriptmmr:true
txninput id:finishchallenge coinid:CHALLENGE_COIN_ID_2  scriptmmr:true
txnoutput id:finishchallenge address:CHALLENGE_WINNER_ADDRESS tokenid:OUTPLAY_TOKENID amount:2
txnsign id:finishchallenge publickey:ADMIN_KEY
txnpost id:finishchallenge
