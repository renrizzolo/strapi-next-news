import React, { Fragment } from "react";
import ReactQuill, { Quill } from "react-quill";
import { ImageDrop } from "quill-image-drop-module";
import "react-quill/dist/quill.snow.css";
import "./quill.custom.css";
import MediaLib from "./MediaLib";
import ImageResize from "quill-image-resize-module-react";

Quill.register("modules/imageResize", ImageResize);
Quill.register("modules/imageDrop", ImageDrop);

var Size = Quill.import("attributors/style/size");
Size.whitelist = ["14px", false, "16px", "18px"];
Quill.register(Size, true);

class QuillEditor extends React.Component {
  constructor(props) {
    super(props);

    this.quillRef = null;
    this.reactQuillRef = null;

    this.state = {
      isFocused: false,
      isMediaLibraryOpened: false,
    };

    this.focus = () => {
      this.setState({ isFocused: true });
      this.reactQuillRef.focus();
    };

    this.blur = () => {
      this.setState({ isFocused: false });
      this.reactQuillRef.blur();
    };
  }

  componentDidMount() {
    this.attachQuillRefs();

    if (this.props.autoFocus) {
      this.focus();
    }
  }

  componentDidUpdate() {
    this.attachQuillRefs();
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.resetProps !== this.props.resetProps) {
      return true;
    }

    if (nextState.isFocused !== this.state.isFocused) {
      return true;
    }

    if (nextState.isMediaLibraryOpened !== this.state.isMediaLibraryOpened) {
      return true;
    }

    return false;
  }

  toggleMediaLib = () => {
    this.setState((prevState) => ({
      ...prevState,
      isMediaLibraryOpened: !prevState.isMediaLibraryOpened,
    }));
  };

  imageHandler = (image, callback) => {
    this.setState({ isMediaLibraryOpened: true });
  };

  addLink = (data) => {
    for (const i of data) {
      let range = this.reactQuillRef.getEditorSelection();
      let position = range ? range.index : this.quillRef.getLength();

      this.quillRef.insertText(position, "\n");
      this.quillRef.insertEmbed(position + 1, "image", i["url"], "user");
    }
  };

  attachQuillRefs = () => {
    if (
      !this.reactQuillRef &&
      typeof this.reactQuillRef.getEditor !== "function"
    )
      return;
    this.quillRef = this.reactQuillRef.getEditor();
  };

  modules = {
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        [{ size: ["14px", false, "16px", "18px"] }],
        ["bold", "italic", "underline", "strike", "blockquote"],
        [{ color: [] }, { background: [] }],
        [
          { align: "justify" },
          { align: "" },
          { align: "center" },
          { align: "right" },
        ],
        [
          { list: "ordered" },
          { list: "bullet" },
          { indent: "-1" },
          { indent: "+1" },
        ],
        ["link", "image"],
        ["clean"],
      ],
      handlers: {
        image: this.imageHandler,
      },
    },
    imageResize: {},
    imageDrop: true,
  };

  formats = [
    "header",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "color",
    "background",
    "align",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
  ];

  render() {
    const { isMediaLibraryOpened } = this.state;
    const { onChange, name, disabled, value } = this.props;
    return (
      <Fragment>
        <ReactQuill
          theme="snow"
          modules={this.modules}
          formats={this.formats}
          readOnly={disabled}
          value={value}
          defaultValue={value}
          onChange={(content, _, source, editor) => {
            onChange({ target: { name, value: content } });
          }}
          ref={(el) => {
            this.reactQuillRef = el;
          }}
        />
        <MediaLib
          isOpen={isMediaLibraryOpened}
          onToggle={this.toggleMediaLib}
          onChange={this.addLink}
        />
      </Fragment>
    );
  }
}

export default QuillEditor;
