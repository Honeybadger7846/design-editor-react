import "react-app-polyfill/ie11";
import * as React from "react";
import * as ReactDOM from "react-dom";
import Providers from "./Providers";
import Editor from "./scenes/Editor";
import Container from "./Container";
import { Template, Interface } from "./constants/editor";

ReactDOM.render(
  <Providers>
    <Container>
      <Editor template={Template} interface={Interface} />
    </Container>
  </Providers>,
  document.getElementById("root")
);
