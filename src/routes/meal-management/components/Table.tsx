import ScrollTable from "@/components/c-catering/ScrollTable";
import { Grid } from "@mantine/core";
import { useSyncExternalStore } from "react";
import store from "../_meal.store";
import Header from "./Header";
import Item from "./Item";

const Table = () => {
  const { currents, canEditPrice } = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
  );

  return (
    <Grid mt={10}>
      <Grid.Col span={12} pb={0}>
        <div>
          <ScrollTable header={<Header />}>
            {Object.values(currents).map((dailyMenu) => (
              <Item
                key={dailyMenu.id}
                dailyMenu={dailyMenu}
                onChangeEstimatedQuantity={(value) =>
                  store.setEstimatedQuantity(dailyMenu.id, value)
                }
                onChangeProductionOrderQuantity={(value) =>
                  store.setProductionOrderQuantity(
                    dailyMenu.id,
                    value,
                  )
                }
                onChangeEmployeeQuantity={(value) =>
                  store.setEmployeeQuantity(dailyMenu.id, value)
                }
                onChangePaymentQuantity={(value) =>
                  store.setPaymentQuantity(dailyMenu.id, value)
                }
                canEditPrice={canEditPrice}
                onChangePrice={(value) =>
                  store.setPrice(dailyMenu.id, value)
                }
              />
            ))}
          </ScrollTable>
        </div>
      </Grid.Col>
    </Grid>
  );
};

export default Table;
