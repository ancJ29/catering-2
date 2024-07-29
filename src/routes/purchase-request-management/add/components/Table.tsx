import MaterialSelector from "@/components/c-catering/MaterialSelector";
import PurchaseTotal from "@/components/c-catering/PurchaseTotal";
import ScrollTable from "@/components/c-catering/ScrollTable";
import useTranslation from "@/hooks/useTranslation";
import { Material } from "@/services/domain";
import useMaterialStore from "@/stores/material.store";
import { Grid } from "@mantine/core";
import { useCallback, useSyncExternalStore } from "react";
import Header from "../../components/Header";
import Item from "../../components/Item";
import store from "../_add-purchase-request.store";

type TableProps = {
  opened: boolean;
  showNeedToOrder?: boolean;
};

const Table = ({ opened, showNeedToOrder = true }: TableProps) => {
  const t = useTranslation();
  const { materials } = useMaterialStore();
  const { materialIds, currents, isSelectAll } = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
  );

  const addMaterial = (materialId: string) => {
    store.addMaterial(materialId, t);
  };

  const removeMaterial = (materialId: string) => {
    store.removeMaterial(materialId);
  };

  const labelGenerator = useCallback(
    (material: Material) => {
      const type = material.others.type;
      return (
        <span style={{ fontSize: ".8rem" }}>
          {material.name}
          &nbsp;
          <span>({t(`materials.type.${type}`)})</span>
        </span>
      );
    },
    [t],
  );

  return (
    <Grid mt={10}>
      <Grid.Col span={opened ? 9 : 12} pb={0}>
        <div>
          <ScrollTable
            header={
              <Header
                isSelectAll={isSelectAll}
                onChangeIsSelectAll={store.setIsSelectAll}
                showNeedToOrder={showNeedToOrder}
              />
            }
            h="calc(-8.5rem - 200px + 100vh)"
          >
            {materialIds.map((materialId) => (
              <Item
                key={materialId}
                material={materials.get(materialId)}
                requestDetail={currents[materialId]}
                isSelected={store.isSelected(materialId)}
                // price={store.getPrice(materialId)}
                onChangeAmount={(value) =>
                  store.setAmount(materialId, value)
                }
                onChangeIsSelected={(value) =>
                  store.setIsSelected(materialId, value)
                }
                onChangSupplierNote={(value) =>
                  store.setSupplierNote(materialId, value)
                }
                onChangeInternalNote={(value) =>
                  store.setInternalNote(materialId, value)
                }
                removeMaterial={() =>
                  store.removeMaterial(materialId)
                }
                showNeedToOrder={showNeedToOrder}
              />
            ))}
          </ScrollTable>
          <PurchaseTotal
            totalMaterial={store.getTotalMaterial()}
            totalPrice={store.getTotalPrice()}
          />
        </div>
      </Grid.Col>
      <Grid.Col
        span={3}
        className="c-catering-bdr-box"
        style={{ display: opened ? "block" : "none" }}
      >
        <MaterialSelector
          onAdd={addMaterial}
          onRemove={removeMaterial}
          labelGenerator={labelGenerator}
          materialIds={materialIds}
          h="calc(-5.5rem - 205px + 100vh)"
        />
      </Grid.Col>
    </Grid>
  );
};

export default Table;
