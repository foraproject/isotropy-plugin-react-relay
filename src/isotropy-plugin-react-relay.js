/* @flow */
import reactAdapter from "isotropy-adapter-react-relay";
import Router from "isotropy-router";

import type { HttpMethodRouteOptionsType, HttpMethodRouteArgsType } from "isotropy-router";
import type { ProcessedIncomingMessage, ServerResponse } from "isotropy-interfaces/node/http";


type HandlerRouteType = {
  type: "handler",
  url: string,
  method: string,
  handler: (...args: Array<any>) => Promise;
}

type ReactComponentRouteType = {
  type: "react",
  url: string,
  method: string,
  Component: Function,
  args: Object,
  options: HttpMethodRouteOptionsType,
  renderToStaticMarkup?: boolean,
  toHtml?: (html: string, props?: Object) => string,
  elementSelector?: string,
  onRender?: Function
}

type RelayRouteType = {
  type: "relay",
  url: string,
  method: string,
  Container: Function,
  RelayRoute: Function,
  graphqlUrl: string,
  args: Object,
  options: HttpMethodRouteOptionsType,
  renderToStaticMarkup?: boolean,
  toHtml?: (html: string, props?: Object) => string,
  elementSelector?: string,
  onRender?: Function
}

type AppRouteType = ReactComponentRouteType | HandlerRouteType | RelayRouteType;

export type ReactPluginConfigType = {
  routes: Array<AppRouteType>,
  type: string,
  path: string,
  renderToStaticMarkup?: boolean,
  toHtml: (html: string, props?: Object) => string,
  elementSelector: string,
  onRender?: Function,
  onError?: (req: ProcessedIncomingMessage, res: ServerResponse, e: any) => void
};

export type ReactConfigType = {
};

export type getDefaultsParamsType = {
  type: string,
  routes: Array<AppRouteType>,
  path?: string,
  renderToStaticMarkup?: boolean,
  toHtml?: (html: string, props?: Object) => string,
  elementSelector?: string,
  onRender?: Function,
  onError?: (req: ProcessedIncomingMessage, res: ServerResponse, e: any) => void
}

const getDefaults = function(val: getDefaultsParamsType) : ReactPluginConfigType {
  return  {
    type: val.type,
    routes: val.routes,
    path: val.path || "/",
    renderToStaticMarkup: (typeof(val.renderToStaticMarkup) !== "undefined" && val.renderToStaticMarkup !== null) ? val.renderToStaticMarkup : false,
    toHtml: val.toHtml || ((html) => html),
    elementSelector: val.elementSelector || "#isotropy-container",
    onRender: val.onRender,
    onError: val.onError
  };
};

const getAppRoute = function(route: Object) : AppRouteType {
  if (typeof route.handler !== "undefined" && route.handler !== null) {
    return Object.assign({}, route, { type: "handler" });
  } else if (typeof route.Component !== "undefined" && route.Component !== null) {
    return Object.assign({}, route, { type: "react" });
  } else if (typeof route.Container !== "undefined" && route.Container !== null) {
    return Object.assign({}, route, { type: "relay" });
  } else {
    throw new Error("Unknown type. Route type must be handler, react or relay.");
  }
};

const getHandlerRoute = function(route: HandlerRouteType, appConfig: ReactPluginConfigType) : HttpMethodRouteArgsType {
  return {
    type: "pattern",
    method: route.method,
    url: route.url,
    handler: route.handler
  };
};

const getReactRoute = function(route: ReactComponentRouteType, appConfig: ReactPluginConfigType) : HttpMethodRouteArgsType {
  return {
    type: "pattern",
    method: route.method,
    url: route.url,
    handler: async (req: ProcessedIncomingMessage, res: ServerResponse, args: Object) => {
      await reactAdapter.render({
          Component: route.Component,
          req,
          res,
          args,
          renderToStaticMarkup: route.renderToStaticMarkup || appConfig.renderToStaticMarkup,
          toHtml: route.toHtml || appConfig.toHtml,
          elementSelector: route.elementSelector || appConfig.elementSelector,
          onRender: route.onRender || appConfig.onRender
        }
      );
    },
    options: { argumentsAsObject: true }
  };
};

const getRelayRoute = function(route: RelayRouteType, appConfig: ReactPluginConfigType) : HttpMethodRouteArgsType {
  return {
    type: "pattern",
    method: route.method,
    url: route.url,
    handler: async (req: ProcessedIncomingMessage, res: ServerResponse, args: Object) => {
      await reactAdapter.renderRelayContainer({
          Container: route.Container,
          RelayRoute: route.RelayRoute,
          graphqlUrl: route.graphqlUrl,
          req,
          res,
          args,
          renderToStaticMarkup: route.renderToStaticMarkup || appConfig.renderToStaticMarkup,
          toHtml: route.toHtml || appConfig.toHtml,
          elementSelector: route.elementSelector || appConfig.elementSelector,
          onRender: route.onRender || appConfig.onRender
        }
      );
    },
    options: { argumentsAsObject: true }
  };
}

const setup = async function(appConfig: ReactPluginConfigType, router: Router, config: ReactConfigType) : Promise {
  const routes = appConfig.routes.map(_route => {
    const route = getAppRoute(_route);
    if (route.type === "handler") {
      return getHandlerRoute(route, appConfig);
    } else if (route.type === "react") {
      return getReactRoute(route, appConfig);
    } else if (route.type === "relay") {
      return getRelayRoute(route, appConfig);
    } else {
      throw new Error("Unknown type. Route type must be handler, react or relay.");
    }
  });
  router.add(routes);
};


export default {
  name: "react-relay",
  getDefaults,
  setup
};
