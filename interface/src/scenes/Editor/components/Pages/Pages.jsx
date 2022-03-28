import * as React from "react";
import { styled } from "baseui";
import { Scrollbars } from "react-custom-scrollbars";
import { useEditor } from "../../../../../../src";
import useAppContext from "../../../../hooks/useAppContext";
import { useEffect } from "react";

function Pages() {
  const editor = useEditor();
  const {
    template,
    setTemplate,
    activePage,
    setActivePage,
    userInterface,
    isMobile,
  } = useAppContext();

  const Container = styled("div", (props) => ({
    display: "flex",
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
  useEffect(() => {}, [template]);
  return (
    <Container>
      <Scrollbars
        autoHide
        autoHideTimeout={1000}
        autoHideDuration={200}
        autoHeight
        autoHeightMin={0}
        autoHeightMax={isMobile ? 170 : 300}
      >
        {template &&
          template.pages.map((page, index) =>
            userInterface.page && userInterface.page.list ? (
              <ZoomItemContainer onClick={() => setPage(index)} key={index}>
                {page.name}
                <div
                  style={{
                    display: "block",
                    width: "100%",
                    height: "100%",
                    maxWidth: isMobile ? "80px" : "100px",
                    maxHeight: isMobile ? "50px" : "60px",
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
              </ZoomItemContainer>
            ) : null
          )}
      </Scrollbars>
    </Container>
  );
}

export default Pages;
