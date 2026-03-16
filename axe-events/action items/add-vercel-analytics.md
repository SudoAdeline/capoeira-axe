# Add Vercel Analytics

Track visitors, page views, countries, and devices — no sign-in required.

## 1. Install the package

```bash
npm i @vercel/analytics
```

## 2. Add the React component

Import and use the `<Analytics />` component in your app's layout.

Since this is a Vite + React project (not Next.js), use the React import:

```jsx
import { Analytics } from "@vercel/analytics/react";
```

Add `<Analytics />` inside your app's root component (e.g. `App.jsx`):

```jsx
function App() {
  return (
    <>
      {/* ...routes and layout... */}
      <Analytics />
    </>
  );
}
```

## 3. Deploy & Visit your Site

Deploy your changes and visit the deployment to collect your page views.

If you don't see data after 30 seconds, check for content blockers and try to navigate between pages on your site.

## Where to see the data

Go to your [Vercel Dashboard](https://vercel.com) > **axe-events** project > **Analytics** tab.
