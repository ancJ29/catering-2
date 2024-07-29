import { Actions } from "@/auto-generated/api-configs";
import AutocompleteForFilterData from "@/components/c-catering/AutocompleteForFilterData";
import CustomButton from "@/components/c-catering/CustomButton";
import Selector from "@/components/c-catering/Selector";
import DataGrid from "@/components/common/DataGrid";
import useFilterData from "@/hooks/useFilterData";
import useOnMounted from "@/hooks/useOnMounted";
import useTranslation from "@/hooks/useTranslation";
import callApi from "@/services/api";
import {
  Material,
  Supplier,
  getMaterialById,
} from "@/services/domain";
import useMaterialStore from "@/stores/material.store";
import useSupplierStore from "@/stores/supplier.store";
import { Box, Flex, Grid, ScrollArea, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useCallback, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { SupplierMaterial, configs } from "./_configs";

const MaterialSupplierManagement = () => {
  const { materialId } = useParams();
  const { set } = useMaterialStore();
  const { suppliers: supplierById } = useSupplierStore();
  const t = useTranslation();
  const [changed, setChanged] = useState(false);
  const [material, setMaterial] = useState<Material>();
  const [prices] = useState<Map<string, number>>(new Map());
  const [actives] = useState<Map<string, boolean>>(new Map());
  const [suppliers, setSuppliers] = useState<SupplierMaterial[]>([]);
  const supplierIds = useMemo(
    () => suppliers.map((sm) => sm.supplier.id),
    [suppliers],
  );

  const load = useCallback(async () => {
    if (!materialId) {
      return;
    }
    setChanged(false);
    const material = await getMaterialById(materialId);
    if (material) {
      setMaterial(material);
      set([material]);
    }
    setSuppliers(
      (
        material?.supplierMaterials.map((sm: SupplierMaterial) => ({
          price: sm.price,
          supplier: {
            id: sm.supplier.id,
            name: sm.supplier.name.split("___")[0],
            others: {
              active: sm.supplier.others.active,
            },
          },
        })) || []
      ).sort((a, b) => a.price - b.price),
    );
  }, [materialId, set]);

  useOnMounted(load);

  const dataLoader = useCallback(() => {
    return Array.from(supplierById.values());
  }, [supplierById]);

  const { data, names, reload } = useFilterData<Supplier>({
    dataLoader,
  });

  const addSupplier = useCallback(
    (supplierId: string) => {
      setChanged(true);
      setSuppliers((prev) => {
        const supplier = supplierById.get(supplierId);
        if (!supplier) {
          return prev;
        }
        return [
          ...(prev || []),
          {
            price: 0,
            supplier: {
              id: supplier.id,
              name: supplier.name,
              others: {
                active: supplier.others.active,
              },
            },
          },
        ];
      });
    },
    [supplierById],
  );

  const removeSupplier = useCallback((supplierId: string) => {
    setChanged(true);
    setSuppliers((prev) => {
      return prev?.filter((sm) => sm.supplier.id !== supplierId);
    });
  }, []);

  const setActive = useCallback(
    async (supplierId: string, active: boolean) => {
      actives.set(supplierId, active);
      setChanged(true);
    },
    [actives],
  );

  const dataGridConfigs = useMemo(() => {
    if (!material) {
      return [];
    }
    return configs(
      t,
      material,
      prices,
      setPrice,
      removeSupplier,
      actives,
      setActive,
    );
    function setPrice(supplierId: string, price: number) {
      prices.set(supplierId, price);
    }
  }, [material, prices, t, removeSupplier, actives, setActive]);

  const save = useCallback(async () => {
    if (
      suppliers?.some((sm) => {
        return sm.price <= 0 && !prices.get(sm.supplier.id);
      })
    ) {
      notifications.show({
        color: "red.5",
        message: t("Please input price for all materials"),
      });
      return;
    }
    if (!suppliers) {
      return;
    }
    await callApi<unknown, { success: boolean }>({
      action: Actions.UPDATE_MATERIAL_SUPPLIER,
      params: {
        materialId,
        suppliers: suppliers.map((sm) => {
          return {
            supplierId: sm.supplier.id,
            price: prices.get(sm.supplier.id) ?? sm.price,
            active:
              actives.get(sm.supplier.id) ??
              sm.supplier.others.active,
          };
        }),
      },
      options: {
        toastMessage: "Your changes have been saved",
      },
    });
    load();
  }, [actives, load, materialId, prices, suppliers, t]);

  if (!supplierById || !material) {
    return <></>;
  }

  return (
    <Box>
      <Box w="100%" pb={10}>
        <Flex w="100%" align="center" justify="space-between">
          <Text className="c-catering-font-bold" size="2rem">
            {material?.name || "-"} - {t("Suppliers")}
          </Text>
          <CustomButton confirm disabled={!changed} onClick={save}>
            {t("Save")}
          </CustomButton>
        </Flex>
        <Grid mt={10}>
          <Grid.Col span={9}>
            {supplierById.size && (
              <DataGrid
                hasUpdateColumn={false}
                hasOrderColumn
                columns={dataGridConfigs}
                data={suppliers}
              />
            )}
          </Grid.Col>
          <Grid.Col span={3} className="c-catering-bdr-box">
            <AutocompleteForFilterData
              mr={10}
              mb={10}
              data={names}
              label={t("Catering name")}
              onReload={reload}
            />
            <ScrollArea h="80vh">
              <Selector
                data={data}
                selectedIds={supplierIds}
                onAdd={addSupplier}
                onRemove={removeSupplier}
              />
            </ScrollArea>
          </Grid.Col>
        </Grid>
      </Box>
    </Box>
  );
};

export default MaterialSupplierManagement;
