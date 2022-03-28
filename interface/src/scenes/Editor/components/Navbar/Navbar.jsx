import * as React from "react";
import { styled, ThemeProvider, DarkTheme } from "baseui";
import { Button, SHAPE, KIND, SIZE } from "baseui/button";
import Icons from "../icons";
import { useEditor } from "../../../../../../src";
import api from "../../../../services/api";
import Zoom from "./components/Zoom";
import { template } from "./template";
import useAppContext from "../../../../hooks/useAppContext";
import { size } from "lodash";

const Container = styled("div", (props) => ({
  height: "56px",
  background: props.$theme.colors.background,
  display: "flex",
  padding: "0 1rem",
  justifyContent: "space-between",
  alignItems: "center",
}));

function NavbarEditor() {
  const editor = useEditor();
  const { template } = useAppContext();
  const downloadImage = async () => {
    await api.downloadTemplate(template).then((result) => {
      function base64ToArrayBuffer(base64) {
        var binaryString = window.atob(base64);
        var binaryLen = binaryString.length;
        var bytes = new Uint8Array(binaryLen);
        for (var i = 0; i < binaryLen; i++) {
          var ascii = binaryString.charCodeAt(i);
          bytes[i] = ascii;
        }
        return bytes;
      }
      function saveByteArray(reportName, byte) {
        var blob = new Blob([byte], { type: "application/pdf" });
        var link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        var fileName = reportName;
        link.download = fileName;
        link.click();
      }
      saveByteArray("output", base64ToArrayBuffer(result));
    });
  };

  const handleLoadTemplate = async () => {
    const fonts = [];
    template.objects.forEach((object) => {
      if (object.type === "StaticText" || object.type === "DynamicText") {
        fonts.push({
          name: object.metadata.fontFamily,
          url: object.metadata.fontURL,
          options: { style: "normal", weight: 400 },
        });
      }
    });
    await loadFonts(fonts);
    editor.importFromJSON(template);
  };

  const loadFonts = (fonts) => {
    const promisesList = fonts.map((font) => {
      // @ts-ignore
      return new FontFace(font.name, `url(${font.url})`, font.options)
        .load()
        .catch((err) => err);
    });
    return new Promise((resolve, reject) => {
      Promise.all(promisesList)
        .then((res) => {
          res.forEach((uniqueFont) => {
            // @ts-ignore
            if (uniqueFont && uniqueFont.family) {
              // @ts-ignore
              document.fonts.add(uniqueFont);
              resolve(true);
            }
          });
        })
        .catch((err) => reject(err));
    });
  };

  return (
    <ThemeProvider theme={DarkTheme}>
      <Container>
        <div style={{ display: "flex", gap: "1rem" }}>
          <div>
            <Button
              onClick={() => {
                editor.undo();
              }}
              size={SIZE.default}
              kind={KIND.tertiary}
              shape={SHAPE.square}
            >
              <Icons.Undo size={22} />
            </Button>
            <Button
              onClick={() => {
                editor.redo();
              }}
              size={SIZE.default}
              kind={KIND.tertiary}
              shape={SHAPE.square}
            >
              <Icons.Redo size={22} />
            </Button>
          </div>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <Zoom />
          <Button
            onClick={downloadImage}
            kind={KIND.primary}
            size={SIZE.compact}
          >
            Save
          </Button>
        </div>
      </Container>
    </ThemeProvider>
  );
}

export default NavbarEditor;
