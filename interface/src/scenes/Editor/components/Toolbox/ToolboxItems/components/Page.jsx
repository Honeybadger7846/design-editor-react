import * as React from "react";

import { Button, KIND, SIZE } from "baseui/button";
import { styled, ThemeProvider, LightTheme } from "baseui";
import { Select, Value } from "baseui/select";
import { Input } from "baseui/input";
import { StatefulPopover, PLACEMENT } from "baseui/popover";
import { useEffect, useState } from "react";
import formatSizes from "../../../../../../constants/format-sizes";
import { useEditor } from "../../../../../../../../src";
import useAppContext from "../../../../../../hooks/useAppContext";

const unit = [
  { name: "Pixel", id: 0 },
  { name: "Centimeter", id: 1 },
  { name: "Inch", id: 2 },
];

const getLabel = ({ option }) => {
  return (
    <div style={{ display: "flex", gap: "0.5rem" }}>
      <div>{option.name}</div>
      <div style={{ color: "#AFAFAF" }}>{option.description}</div>
    </div>
  );
};

const Container = styled("div", (props) => ({
  background: props.$theme.colors.background,
  color: props.$theme.colors.primary,
  width: "320px",
  fontFamily: "Uber Move Text",
  padding: "2rem 2rem",
}));

export default function Page() {
  const editor = useEditor();
  const { template, setTemplate, activePage } = useAppContext();
  const [value, setValue] = useState([]);
  const [customSize, setCustomSize] = useState({ width: 0, height: 0 });
  const [name, setName] = useState("");
  const [unitValue, setUnitValue] = useState([]);
  const convertToPx = (unit, value) => {
    let dpi = 96; // window.devicePixelRatio
    switch (unit) {
      case "Pixel":
        return Number(value);
      case "Centimeter":
        return ((Number(value) * dpi) / 2.54).toFixed(2);
      case "Inch":
        return (Number(value) * dpi).toFixed(2);
      default:
        return Number(value);
    }
  };
  const convertFromPx = (unit, value) => {
    let dpi = 96; // window.devicePixelRatio
    switch (unit) {
      case "Pixel":
        return Number(value);
      case "Centimeter":
        return ((Number(value) / dpi) * 2.54).toFixed(2);
      case "Inch":
        return (Number(value) / dpi).toFixed(2);
      default:
        return Number(value);
    }
  };
  const updateTemplate = () => {
    if (template && template.pages) {
      template.pages[activePage.index] = editor.exportToJSON();
      setTemplate(Object.assign({}, template));
    }
  };
  const updateName = (value) => {
    setName(value);
    editor.page.handler.setName(value);
    updateTemplate();
  };
  const updateFormatSize = (value) => {
    setValue(value);
    const [page] = value;
    editor.page.update(page.size);
    updateTemplate();
  };
  const updateUnit = (value) => {
    setUnitValue(value);
    template.unit = value[0].name;
    updateTemplate();
  };
  const applyCustomSize = () => {
    if (customSize.width && customSize.height) {
      editor.page.update({
        width: Number(convertToPx(template.unit, customSize.width)),
        height: Number(convertToPx(template.unit, customSize.height)),
      });
      updateTemplate();
    }
  };
  useEffect(() => {
    if (template.pages) {
      let page = template.pages[activePage.index];
      setName(page.name);
      setUnitValue([{ name: template.unit }]);
      setCustomSize({
        width: Number(convertFromPx(template.unit, page.size.width)),
        height: Number(convertFromPx(template.unit, page.size.height)),
      });
    }
  }, [template, activePage]);

  return (
    <StatefulPopover
      focusLock
      placement={PLACEMENT.bottom}
      content={({ close }) => (
        <ThemeProvider theme={LightTheme}>
          <Container>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <div>Name</div>
              <div style={{ display: "flex", gap: "1rem" }}>
                <Input
                  value={name}
                  onChange={(e) => updateName(e.target.value)}
                  placeholder="name"
                />
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                marginTop: "1rem",
              }}
            >
              <div>Preset</div>
              <Select
                options={formatSizes}
                valueKey="name"
                onChange={({ value }) => updateFormatSize(value)}
                value={value}
                getValueLabel={getLabel}
                getOptionLabel={getLabel}
                clearable={false}
              />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                marginTop: "1rem",
              }}
            >
              <div>Unit</div>
              <Select
                options={unit}
                labelKey="name"
                valueKey="id"
                onChange={({ value }) => updateUnit(value)}
                value={unitValue}
                getValueLabel={getLabel}
                getOptionLabel={getLabel}
                clearable={false}
              />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                marginTop: "1rem",
              }}
            >
              <div>Custom size</div>
              <div style={{ display: "flex", gap: "1rem" }}>
                <Input
                  value={customSize.width}
                  onChange={(e) =>
                    setCustomSize({
                      ...customSize,
                      width: Number(e.target.value),
                    })
                  }
                  startEnhancer="W"
                  placeholder="width"
                />
                <Input
                  value={customSize.height}
                  onChange={(e) =>
                    setCustomSize({
                      ...customSize,
                      height: Number(e.target.value),
                    })
                  }
                  startEnhancer="H"
                  placeholder="width"
                />
              </div>
              <Button
                onClick={() => {
                  applyCustomSize();
                  close();
                }}
              >
                Apply
              </Button>
            </div>
          </Container>
        </ThemeProvider>
      )}
    >
      <Button size={SIZE.compact} kind={KIND.tertiary}>
        Resize
      </Button>
    </StatefulPopover>
  );
}
