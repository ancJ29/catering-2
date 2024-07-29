import {
  Actions,
  configs as actionConfigs,
  xProductSchema,
} from "@/auto-generated/api-configs";
import callApi from "@/services/api";
import logger from "@/services/logger";
import { ONE_DAY } from "@/utils";
import { z } from "zod";

const response =
  actionConfigs[Actions.GET_ALL_PRODUCTS].schema.response;

const productSchema = response.transform((array) => array[0]);

const cacheSchema = xProductSchema
  .omit({
    createdAt: true,
    updatedAt: true,
    clientId: true,
  })
  .extend({
    updatedAt: z.string(),
  })
  .transform((el) => ({
    ...el,
    updatedAt: new Date(el.updatedAt),
  }))
  .array();

export type Product = z.infer<typeof productSchema>;

export async function getAllProducts(
  noCache = false,
): Promise<Product[]> {
  try {
    if (!noCache && localStorage.__All_PRODUCTS__) {
      const rawData = JSON.parse(localStorage.__All_PRODUCTS__);
      if (Date.now() - rawData.savedAt < ONE_DAY) {
        const res = cacheSchema.safeParse(rawData.data);
        if (res.success) {
          logger.info("111 cache hit");
          return res.data;
        } else {
          logger.info("cache invalid", res.error);
        }
      }
    }
  } catch (e) {
    logger.error("cache error", e);
  }
  let products = await callApi<unknown, Product[]>({
    action: Actions.GET_ALL_PRODUCTS,
    params: {},
    options: { noCache },
  });
  products = products?.map((product) => {
    product.name = product.name.split("___")[0];
    return product;
  });
  localStorage.__All_PRODUCTS__ = JSON.stringify({
    data: products || [],
    savedAt: Date.now(),
  });
  return products || [];
}

export function productTypeOptions(
  types: string[],
  t: (_: string) => string,
) {
  return types.map((type) => ({
    label: t(`products.type.${type}`),
    value: type,
  }));
}
