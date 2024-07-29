import PurchaseRequestFilter from "@/components/c-catering/PurchaseRequestFilter";
import DataGrid from "@/components/common/DataGrid";
import {
  FilterType,
  defaultCondition,
  filter,
} from "@/configs/filters/purchase-request";
import useFilterData from "@/hooks/useFilterData";
import useTranslation from "@/hooks/useTranslation";
import {
  PurchaseRequest,
  getPurchaseRequests,
  typePriorityAndStatusRequestOptions,
} from "@/services/domain";
import useCateringStore from "@/stores/catering.store";
import { endOfDay, startOfDay } from "@/utils";
import { Button, Flex, Stack } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { configs } from "./_configs";

const PurchaseRequestManagement = () => {
  const t = useTranslation();
  const navigate = useNavigate();
  const [purchaseRequests, setPurchaseRequests] = useState<
    PurchaseRequest[]
  >([]);
  const { caterings } = useCateringStore();

  const dataGridConfigs = useMemo(
    () => configs(t, caterings),
    [t, caterings],
  );

  const [typeOptions, priorityOptions, statusOptions] =
    useMemo(() => {
      return typePriorityAndStatusRequestOptions(t);
    }, [t]);

  const getData = async (from?: number, to?: number) => {
    setPurchaseRequests(await getPurchaseRequests(from, to));
  };

  useEffect(() => {
    getData();
  }, []);

  const dataLoader = useCallback(() => {
    return purchaseRequests;
  }, [purchaseRequests]);

  const {
    condition,
    data,
    keyword,
    names,
    page,
    reload,
    setPage,
    updateCondition,
    filtered,
    reset,
  } = useFilterData<PurchaseRequest, FilterType>({
    dataLoader: dataLoader,
    filter,
    defaultCondition,
  });

  const onChangeDateRange = (from?: number, to?: number) => {
    if (condition?.from && condition?.to && from && to) {
      const _from = startOfDay(from);
      const _to = endOfDay(to);
      if (from < condition.from || to > condition.to) {
        getData(_from, _to);
      }
      updateCondition("from", "", _from);
      updateCondition("to", "", to);
    }
  };

  const onRowClick = (item: PurchaseRequest) => {
    navigate(`/purchase-request-management/${item.id}`);
  };

  return (
    <Stack gap={10} key={caterings.size}>
      <Flex justify="end" align="end">
        <Button
          onClick={() => navigate("/purchase-request-management/add")}
          leftSection={<IconPlus size={16} />}
        >
          {t("Add purchase request")}
        </Button>
      </Flex>
      <PurchaseRequestFilter
        keyword={keyword}
        from={condition?.from}
        to={condition?.to}
        types={condition?.types}
        priorities={condition?.priorities}
        statuses={condition?.statuses}
        departmentIds={condition?.departmentIds}
        purchaseOrderIds={names}
        typeOptions={typeOptions}
        priorityOptions={priorityOptions}
        statusOptions={statusOptions}
        clearable={filtered}
        onClear={reset}
        onReload={reload}
        onChangeTypes={updateCondition.bind(null, "types", "")}
        onChangePriorities={updateCondition.bind(
          null,
          "priorities",
          "",
        )}
        onChangeStatuses={updateCondition.bind(null, "statuses", "")}
        onChangeDepartmentIds={updateCondition.bind(
          null,
          "departmentIds",
          "",
        )}
        onChangeDateRange={onChangeDateRange}
      />
      <DataGrid
        onRowClick={onRowClick}
        page={page}
        limit={10}
        isPaginated
        hasOrderColumn
        columns={dataGridConfigs}
        data={data}
        onChangePage={setPage}
      />
    </Stack>
  );
};

export default PurchaseRequestManagement;
