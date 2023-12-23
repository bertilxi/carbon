import type {
  Context,
  Handler as HonoHandler,
  MiddlewareHandler,
  Env,
  Input,
} from "hono";

type FuntionListParameters<T extends ((...parameters: any) => any)[]> =
  T extends ((...parameters: infer P) => any)[] ? P : never;

export type Handler<
  E extends Env = any,
  P extends string = any,
  I extends Input = Input,
> = HonoHandler<E, P, I>;
export type Middleware<
  E extends Env = any,
  P extends string = any,
  I extends Input = Input,
> = MiddlewareHandler<E, P, I>;
export type PageProperties<C extends Context = Context> = {
  c: C;
};
export type FromMiddleware<
  M extends Middleware[],
  C extends Context = Context,
> = FuntionListParameters<M>[0] & C;

export type PageWithMiddleware<
  M extends Middleware[],
  C extends Context = Context,
> = PageProperties<FromMiddleware<M, C>>;
