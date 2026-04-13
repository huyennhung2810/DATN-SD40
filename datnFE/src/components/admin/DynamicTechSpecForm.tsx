import React, { useEffect, useState, useCallback } from "react";
import {
  Row,
  Col,
  Form,
  Input,
  InputNumber,
  Select,
  Typography,
  Divider,
  Spin,
  Empty,
  Space,
  message,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import { techSpecDefinitionActions } from "../../redux/techSpec/techSpecDefinitionSlice";
import { techSpecGroupActions } from "../../redux/techSpec/techSpecGroupSlice";
import { techSpecDefinitionItemApi } from "../../api/techSpecGroupApi";
import type {
  TechSpecDefinitionResponse,
  TechSpecDefinitionItemResponse,
} from "../../models/techSpecGroup";

const { Text } = Typography;

// Cache items per definitionId
const itemsCache: Record<string, TechSpecDefinitionItemResponse[]> = {};
// Track unsaved new items per definitionId
const newItemsCache: Record<string, TechSpecDefinitionItemResponse[]> = {};

interface DynamicTechSpecFormProps {
  form: any;
}

const DynamicTechSpecForm: React.FC<DynamicTechSpecFormProps> = ({ form }) => {
  const dispatch = useDispatch();
  const groupState = useSelector((state: RootState) => state.techSpecGroup);
  const defState = useSelector((state: RootState) => state.techSpecDefinition);

  // Items per definition (fetched from API)
  const [itemsMap, setItemsMap] = useState<Record<string, TechSpecDefinitionItemResponse[]>>({});
  const [loadingItems, setLoadingItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    dispatch(techSpecGroupActions.getAll({ page: 0, size: 50, status: undefined }));
    dispatch(techSpecDefinitionActions.getAll({ page: 0, size: 500, status: undefined }));
  }, [dispatch]);

  // Fetch items for a definition
  const fetchItems = useCallback(async (defId: string) => {
    if (itemsCache[defId] && !newItemsCache[defId]) {
      setItemsMap((prev) => ({ ...prev, [defId]: itemsCache[defId] }));
      return;
    }
    setLoadingItems((prev) => ({ ...prev, [defId]: true }));
    try {
      const items = await techSpecDefinitionItemApi.getByDefinitionId(defId);
      itemsCache[defId] = items;
      setItemsMap((prev) => ({ ...prev, [defId]: [...items, ...(newItemsCache[defId] || [])] }));
    } catch {
      setItemsMap((prev) => ({ ...prev, [defId]: newItemsCache[defId] || [] }));
    } finally {
      setLoadingItems((prev) => ({ ...prev, [defId]: false }));
    }
  }, []);

  // Add new ENUM item from the dropdown
  const handleAddEnumItem = async (defId: string, defCode: string, newValue: string) => {
    const trimmed = newValue.trim();
    if (!trimmed) return;

    // Check if already exists
    const existing = (itemsCache[defId] || []).find(
      (i) => i.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (existing) {
      form.setFieldValue(["techSpecDynamic", `spec_${defCode || defId}`], existing.name);
      return;
    }

    try {
      const res = await techSpecDefinitionItemApi.create({
        definitionId: defId,
        name: trimmed,
        value: trimmed,
        status: "ACTIVE",
      });
      const created: TechSpecDefinitionItemResponse = res.data;

      // Update caches
      if (!itemsCache[defId]) itemsCache[defId] = [];
      itemsCache[defId] = [...itemsCache[defId], created];

      if (!newItemsCache[defId]) newItemsCache[defId] = [];
      newItemsCache[defId] = [...newItemsCache[defId], created];

      setItemsMap((prev) => ({
        ...prev,
        [defId]: [...(prev[defId] || []), created],
      }));

      form.setFieldValue(["techSpecDynamic", `spec_${defCode || defId}`], created.name);
      message.success(`Đã thêm "${trimmed}" vào danh sách`);
    } catch {
      message.error("Không thể thêm giá trị mới");
    }
  };

  if (groupState.loading || defState.loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <Spin description="Đang tải cấu hình thông số kỹ thuật..." />
      </div>
    );
  }

  if (groupState.list.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <Text type="secondary">
            Chưa có cấu hình nhóm thông số kỹ thuật.{" "}
            <a href="/admin/tech-spec" target="_blank" rel="noopener noreferrer">
              Thiết lập tại đây
            </a>
          </Text>
        }
      />
    );
  }

  // Filter out BOOLEAN and RANGE
  const filteredDefs = defState.list.filter(
    (def) => def.dataType !== "BOOLEAN" && def.dataType !== "RANGE"
  );

  const definitionsByGroup = filteredDefs.reduce<Record<string, TechSpecDefinitionResponse[]>>((acc, def) => {
    if (!acc[def.groupId]) acc[def.groupId] = [];
    acc[def.groupId].push(def);
    return acc;
  }, {});

  Object.keys(definitionsByGroup).forEach((groupId) => {
    definitionsByGroup[groupId].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  });

  const sortedGroups = [...groupState.list].sort(
    (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
  );

  const renderField = (def: TechSpecDefinitionResponse) => {
    const fieldCode = def.code || def.id;
    const fieldName = `spec_${fieldCode}`;
    const fieldPath = ["techSpecDynamic", fieldName] as const;
    const isEnum = def.dataType === "ENUM";
    const isText = def.dataType === "TEXT";
    const isNumber = def.dataType === "NUMBER";
    const label = def.name + (def.unit ? ` (${def.unit})` : "");

    if (isEnum) {
      const items = itemsMap[def.id] || [];
      const isLoading = loadingItems[def.id] || false;

      return (
        <Form.Item
          key={def.id}
          name={fieldPath}
          label={label}
          style={{ marginBottom: "12px" }}
        >
          <Select
            showSearch
            allowClear
            placeholder={`Chọn ${def.name.toLowerCase()}...`}
            options={items.map((item) => ({
              label: item.name,
              value: item.name,
            }))}
            filterOption={(input, option) =>
              (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
            }
            popupRender={(menu) => (
              <>
                {menu}
                <div style={{ padding: "8px 12px", borderTop: "1px solid #f0f0f0" }}>
                  <Input
                    ref={(el) => {
                      // Store ref for programmatic focus
                      (window as any).__enumAddInputRef = (window as any).__enumAddInputRef || {};
                      (window as any).__enumAddInputRef[def.id] = el;
                    }}
                    placeholder="Nhập giá trị mới → Enter"
                    size="small"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const inputEl = e.target as HTMLInputElement;
                        const val = inputEl.value.trim();
                        if (val) {
                          handleAddEnumItem(def.id, fieldCode, val);
                          inputEl.value = "";
                        }
                      }
                    }}
                    suffix={
                      <Text type="secondary" style={{ fontSize: "11px" }}>
                        Enter
                      </Text>
                    }
                  />
                </div>
              </>
            )}
            notFoundContent={isLoading ? <Spin size="small" /> : null}
            onFocus={() => {
              if (!itemsMap[def.id]) fetchItems(def.id);
            }}
          />
        </Form.Item>
      );
    }

    if (isText) {
      return (
        <Form.Item
          key={def.id}
          name={fieldPath}
          label={label}
          style={{ marginBottom: "12px" }}
        >
          <Input placeholder={`Nhập ${def.name.toLowerCase()}...`} />
        </Form.Item>
      );
    }

    if (isNumber) {
      return (
        <Form.Item
          key={def.id}
          name={fieldPath}
          label={label}
          style={{ marginBottom: "12px" }}
        >
          <InputNumber
            placeholder={`Nhập ${def.name.toLowerCase()}...`}
            style={{ width: "100%" }}
            min={0}
          />
        </Form.Item>
      );
    }

    return null;
  };

  return (
    <div>
      <Row gutter={[16, 0]}>
        {sortedGroups.map((group, groupIndex) => {
          const defs = definitionsByGroup[group.id] || [];
          if (defs.length === 0) return null;

          return (
            <Col span={24} key={group.id}>
              <Divider orientation="left" style={{ marginTop: groupIndex > 0 ? "16px" : "0" }}>
                <Space>
                  <Text strong style={{ fontSize: "14px" }}>
                    {group.name}
                  </Text>
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    ({defs.length} thông số)
                  </Text>
                </Space>
              </Divider>
              <Row gutter={[16, 0]}>
                {defs.map((def) => (
                  <Col span={12} key={def.id}>
                    {renderField(def)}
                  </Col>
                ))}
              </Row>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default DynamicTechSpecForm;
