import * as React from "react";
import { styled } from "baseui";
import { Scrollbars } from "react-custom-scrollbars";
import { Button, SHAPE, KIND, SIZE } from "baseui/button";
import { useEditor } from "../../../../../../src";
import useAppContext from "../../../../hooks/useAppContext";
import { useEffect, useState } from "react";
import UserLock from "../Users/UserLock";
import Icons from "../icons";

function Pages() {
  const editor = useEditor();
  const {
    template,
    setTemplate,
    activePage,
    setActivePage,
    adminRole,
    isMobile,
    visiblePages,
    setVisiblePages,
  } = useAppContext();

  const Container = styled("div", (props) => ({
    display: "flex",
    flexDirection: "column",
    position: "absolute",
    bottom: isMobile ? "20px" : "20px",
    width: isMobile ? "90px" : "120px",
    right: isMobile ? "20px" : "20px",
  }));

  const ZoomItemContainer = styled("div", () => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.85rem",
    wordWrap: "break-word",
    textAlign: "center",
    padding: "10px",
  }));

  let togglePages = () => {
    setVisiblePages(!visiblePages);
  };
  let addPage = () => {
    const newPage = {
      name: "New Page",
      id: (Math.random() + 1).toString(36).substring(7),
      objects: [],
      background: "#ffffff",
      size: {
        width: 1280,
        height: 720,
      },
      preview: "",
    };
    template.pages.push(newPage);
    setTemplate(Object.assign({}, template));
    // init page
    setActivePage({ index: template.pages.length - 1 });
  };

  let removePage = (index) => {
    if (confirm("Are you sure to delete this page ?") == true) {
      template.pages = template.pages.filter(
        (page, _index) => _index !== index
      );
      setTemplate(Object.assign({}, template));
      // init first page
      setActivePage(
        template.pages[index - 1] ? { index: index - 1 } : { index: 0 }
      );
    }
  };

  let setPage = (index) => {
    if (editor) editor.off("history:changed");
    setActivePage({ index: index });
  };
  useEffect(() => {
    if (editor && template) {
      const page = template.pages[activePage.index];
      if (!page && editor) {
        editor.off("history:changed");
        editor.clear();
        return;
      }
      editor.importFromJSON(page);
      editor.on("history:changed", () => {
        template.pages[activePage.index] = editor.exportToJSON();
        setTemplate(Object.assign({}, template));
      });
    }
    return () => {
      if (editor) editor.off("history:changed");
    };
  }, [activePage]);
  useEffect(() => {}, [template, visiblePages]);
  return (
    <Container>
      <Button size={SIZE.compact} kind={KIND.secondary} onClick={addPage}>
        Add Page
      </Button>
      {visiblePages ? (
        <Scrollbars
          autoHide
          autoHideTimeout={1000}
          autoHideDuration={200}
          autoHeight
          autoHeightMin={0}
          autoHeightMax={isMobile ? 170 : 300}
        >
          {template &&
            template.pages.map((page, index) => (
              <ZoomItemContainer key={index}>
                {page.name}

                <div
                  style={{
                    position: "relative",
                  }}
                >
                  <div
                    onClick={() => setPage(index)}
                    style={{
                      display: "block",
                      width: "100%",
                      height: "100%",
                      minHeight: "56px",
                      maxWidth: isMobile ? "80px" : "100px",
                      maxHeight: isMobile ? "56px" : "60px",
                      border:
                        index === activePage.index
                          ? "1px solid rgba(0, 0, 0, 1)"
                          : "1px solid rgba(0, 0, 0, 0.2)",
                      ":hover": {
                        border: "1px solid rgba(0, 0, 0, 0.7)",
                        cursor: "pointer",
                      },
                      cursor: "pointer",
                      backgroundColor: "#ffffff",
                      marginTop: "5px",
                      aspectRatio: `${page.size.width} / ${page.size.height}`,
                    }}
                    dangerouslySetInnerHTML={{ __html: page.preview }}
                  ></div>

                  <div
                    style={{
                      position: "absolute",
                      overflow: "hidden",
                      top: -8,
                      right: -8,
                      zIndex: 100,
                    }}
                  >
                    <Button
                      onClick={() => {
                        removePage(index);
                      }}
                      size={SIZE.mini}
                      kind={KIND.BaseButton}
                      shape={SHAPE.circle}
                      overrides={{
                        BaseButton: {
                          style: () => ({
                            width: "22px",
                            height: "22px",
                          }),
                        },
                      }}
                    >
                      <Icons.Delete size={16} />
                    </Button>
                  </div>
                </div>
              </ZoomItemContainer>
            ))}
        </Scrollbars>
      ) : null}
      <Button size={SIZE.compact} onClick={togglePages}>
        Pages ({template && template.pages && template.pages.length})
      </Button>
    </Container>
  );
}

export default Pages;
