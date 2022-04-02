import * as React from "react";
import { useEffect, useState } from "react";
import useAppContext from "../../../../../hooks/useAppContext";
import { Scrollbars } from "react-custom-scrollbars";
import { Input, SIZE } from "baseui/input";
import Icons from "../../../../../components/icons";
import { useEditor } from "../../../../../../../src";
import { useDebounce } from "use-debounce";
import { FileUploader } from "baseui/file-uploader";

function Photos() {
  const [search, setSearch] = useState("");
  const { photos } = useAppContext();
  const [value] = useDebounce(search, 1000);
  const editor = useEditor();
  const addImageToCanvas = (url) => {
    const options = {
      type: "StaticImage",
      metadata: { src: url },
    };
    editor.add(options);
  };
  const uploadImage = (files) => {
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = function (event) {
        addImageToCanvas(event.target.result);
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div style={{ display: "flex", height: "100%", flexDirection: "column" }}>
      <div style={{ padding: "1rem 1rem" }}>
        <Input
          startEnhancer={() => <Icons.Search size={16} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size={SIZE.compact}
          placeholder="Search images"
          clearOnEscape
        />
      </div>
      <div style={{ padding: "2rem 2rem" }}>
        <FileUploader onDrop={uploadImage} />
      </div>
      <div style={{ flex: 1 }}>
        <Scrollbars>
          <div
            style={{
              display: "grid",
              gap: "0.5rem",
              padding: "2rem 2rem",
              gridTemplateColumns: "1fr 1fr",
            }}
          >
            {photos.map((img) => (
              <div
                key={img.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                }}
                onClick={() => addImageToCanvas(img.url)}
              >
                <img width="100%" src={img.url} alt="preview" />
              </div>
            ))}
          </div>
        </Scrollbars>
      </div>
    </div>
  );
}

export default Photos;
