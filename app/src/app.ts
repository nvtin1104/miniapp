// React core
import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";

// Router
import router from "@/router";

// Apollo Client
import { ApolloProvider } from "@apollo/client";
import client from "@/graphql/apolloClient"; 

// Error Boundary
import ErrorBoundary from "@/components/error-boundary";

// ZaUI stylesheet
import "zmp-ui/zaui.css";
// Tailwind stylesheet
import "@/css/tailwind.scss";
// Your stylesheet
import "@/css/app.scss";

// Expose app configuration
import appConfig from "../app-config.json";

if (!window.APP_CONFIG) {
  window.APP_CONFIG = appConfig;
}

// Mount the app
const root = createRoot(document.getElementById("app")!);
root.render(
  createElement(ErrorBoundary, {
    children: createElement(ApolloProvider, { 
      client,
      children: createElement(RouterProvider, { router })
    })
  })
);
