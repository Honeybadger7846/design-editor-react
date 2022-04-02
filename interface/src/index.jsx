import "react-app-polyfill/ie11";
import * as React from "react";
import * as ReactDOM from "react-dom";
import Providers from "./Providers";
import Editor from "./scenes/Editor";
import Container from "./Container";
import { Template } from "./constants/editor";

ReactDOM.render(
  <Providers>
    <Container>
      <Editor template={Template} adminRole={true} />
    </Container>
  </Providers>,
  document.getElementById("root")
);
