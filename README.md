# Jita Anywhere
> Buy EVE goods away from your desk, all profits go to Plex For Good - [jita-anywhere.netlify.app](https://jita-anywhere.netlify.app)

![Jita Anywhere](https://i.ibb.co/RzKQNNQ/Screenshot-2023-11-20-at-16-54-32.png)


## What is it about?
- Public website - [jita-anywhere.netlify.app](https://jita-anywhere.netlify.app)
- It's a way for users to buy items when they are are away from their PCs, on their mobiles or wherever the are in the world
- It introduces a new style of role for EVE players in the form of a 'shopping agent', where you can be paid to fulfil users' orders
- Backed and supported by CSM member Oz and the team
- Profits do not go to players, it goes to Plex For Good

## Technical Overview
- Simple solid.js UI
- Static site hosted UI
- All server-side functionality hosted in lambda functions (currently a mono-lambda)
- Hosted primarily on netlify
- Heroku hosted scheduled services
- ZERO run time costs. All currently within free tier. Minus the domain name.


## Getting Started - Development
- Install node.js and `npm i`
- Setup a mongodb instance, can be anywhere
- Setup EVE Online SSO application - eg, for local and production
- Rename `.env.example` to `.env`
- Populate environment variables
- You can run `npm run generate-data` to download, process and prepare data set from EVE SDE
- Install and configure `netlify dev` for local development
- Run local development by running `netlify dev` - Which builds local front and netlify local lambda function APIs

## Prod Deployment
- Configure netlify environment variables
- Link netlify to github for automated deployments
- Heroku is used for scheduled services (polling newly created contracts, checking corp transactions and updating payments etc) - Add heroku scheduler plugin and configure to run `node backend/scheduled-service/job.js` every 10 minutes. Disable web dynos

<details>

<summary>Process Flow Details</summary>


### Add funds

```mermaid
flowchart TD

    a1[User EVE wallet] -- Deposit in JA account --> a2[JA EVE wallet];
    a3[Jita Anywhere background Job]-- Check for updates-->a2;
    a2 -->a3;
    a3 -- Update balance --> a4[User JA balance increase];
    a3 -- Notify user --> a5[User];

```


### User Checkout
```mermaid
flowchart TD

    b1[User] -- Add to cart --> b2[Cart 90m mats & broker fee, 5m agent, 5m P4G, 10m shipping];
    b2 -- Create Order --> b3[User JA balance decrease - 'reserved' 110m - 90+5+5+10];
    b2 -- Create Order --> b4[Order available to agents];
    b2 -- Status update --> b5[Order Status: Available];
    b4 -- Notify agents --> b7[Agents];

```




### Order fulfilment

```mermaid
flowchart TD

    c1[Agent] -- Views --> c2[Order list];
    c2 -- Claims --> c3[Order];
    c3a[Order Status: Available] -- Listed --> c3[Order];
    c3 -- Status update --> c4[Order Status: Claimed];
    c4 -- Checks in game prices --> c5{Agent EVE Client};
    c5 -- Too expensive --> c6[Agent on JA website];
    c6 -- Fills in 'in game' price details --> c8[Order Status: Price increase];
    c8 -- Notify user --> c9{User with fresh price info};

    c9 -- User says no --> c10[Order Status: Cancelled];
    c9 -- Not enough additional balance in User JA account  --> c10;
    c9 -- Yes --> c12[Order requires more funds];

    c10 -- Notified of cancel --> c11[Agent];
    c10 -- Reserved funds released --> c13[User JA balance increase];

    c12 -- Update balance --> c14[User JA balance decrease];
    c12 -- Update status --> c3a;
    c12 -- Notify --> c12a[Agent];
    c5 -- Agent buys & ships 100m --> c16[Agent EVE Client];
    c16 -- Agent create contract --> c17[User EVE Client];
    c17 -- User accept contract --> c18[User goods delivered];
    c16 --> c19[Agent on JA website];

    c19 -- Updates status --> c20a[Order Status: Delivered];
    c18 -- Updates status --> c20b[User on JA website];

    c20b -- Updates status --> c20[Order Status: Complete];

    c20 -- Balance update 110m --> c21[User JA balance reserved turns to paid];
    c20 -- Balance update 105m --> c22[Agent JA balance increase];
    c20 -- Balance update 5m --> c23[P4G JA balance increase];
    c20 -- Notify --> c25[Agent]


    c19 -- Dispute --> c24[Dispute process];
    c20b -- Dispute --> c24[Dispute process];
```




### Fund withdrawal, including plex for good

```mermaid
flowchart TD

    e1[User] -- Requests withdrawal --> e2[JA Website];
    e2 -- Create withdraw request --> e3[Status: Pending];
    e2 -- Notify Admin --> e4[Admin];
    e4 -- Looks at --> e5[JA Website];
    e4 -- Opens --> e6[Admin EVE Client];

    e6 -- Transfers funds --> e6;
    e6 -- Looks at --> e8[JA Website];
    e8 -- Admin updates status --> e7[Status: Transfer complete];
    e9[Background task monitor corp journal] -- monitors --> e7;
    e9 -- Updates status --> e10[Status: Complete];
```



### Dispute process

```mermaid
flowchart TD

    t --> b --> c;
    
```



### Process of orders with no changes (unattractive orders, unresponsive agents, unresponsive users)

```mermaid
flowchart TD

    t --> b --> c;
    
```

</details>
