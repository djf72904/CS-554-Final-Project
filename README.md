This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, install the necessary packages, by running: 
```bash
# recommended
npm install --force  

# or
npm install --legacy-peer-deps
```

Next, install RabbitMQ and make sure it is running:
```bash
# TODO
```

Then, run the development server:

```bash
# recommended
npm run dev

# or
npx next dev
```

Lastly, open another terminal and seed the database:
```bash
npm rn seed
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. To be safe make sure to check the console for the link to the server in case there is already a process running on port:3000  
***
**IMPORTANT FOR TESTING**  
When testing this website, make sure to have two users with a Stevens account available. This is because only valid .edu emails are allowed to make accounts. Therefore, if interactions between users want to be seen to the true potential, it would be best to be done in this way.