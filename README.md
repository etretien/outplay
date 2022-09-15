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
Please note: we’re still having an issue in the Dapp regarding Minima interaction (our developers have been in contact with Minima support on this), as follows. Application logic is based ​​on OUTPLAY tokens (based on Minima), these tokens would be given to users for different activities or in exchange for Minima tokens, and could be spent on the challenges. We wrote a smart-contract and sent a few OUTPLAY tokens to it, but we couldn’t get them to show up on a test client device for interacting with them (e.g. exchange).
Implementation plan: If the winner has NFT, then he also receives an additional bonus from the application. The loser will still lose only the x App tokens wagered on the game. Some NFTs may guarantee an additional reward in the event of a loss.

## Player rating
Player rating is available to all users. It is also possible to search by the list of players.

## Future Implementation: Marketplace for the NFTs
Players can purchase NFTs from the in-app market. NFTs should be in the form of various tennis-related products. NFTs allow users to receive bonuses when participating in activities within the application itself and within other project related activities (such as community activity in social media etc.).

## Future Implementation: The exchange of application tokens (Outplay) and Minima tokens.
The user can exchange application tokens for Minima tokens and vice versa. He can send, receive, store the App tokens in his in-app wallet.

## Future Implementation: Fans.
Players can invite to the application their relatives and friends who do not play tennis. Those users will receive the role of “fans”. They will also be able to receive rewards for using the app and supporting players, but will not have a game rating.
