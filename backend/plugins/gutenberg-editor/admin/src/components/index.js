import React from "react";
import { useLocation } from "react-router";
import { Error } from "@buffetjs/core";
import { isEmpty } from "lodash";
import cn from "classnames";
import { useEffect, useState } from "@wordpress/element";
import {
  BlockEditorKeyboardShortcuts,
  BlockEditorProvider,
  BlockList,
  BlockInspector,
  WritingFlow,
  ObserveTyping,
} from "@wordpress/block-editor";
import {
  Popover,
  SlotFillProvider,
  DropZoneProvider,
  Modal,
  Button,
} from "@wordpress/components";
import { registerCoreBlocks } from "@wordpress/block-library";
import "@wordpress/format-library";
import { Description, ErrorMessage, Label } from "@buffetjs/styles";
import { getBlockContent, getBlockTypes } from "@wordpress/blocks";
import { addFilter } from "@wordpress/hooks";
import ReplaceWPMediaUploader from "./ReplaceMediaUploader";

import MediaLib from "./MediaLib";
import "./style.scss";

const BLOCKS_FIELD = "gutenberg_blocks";

function WysiwygWithErrors({
  autoFocus,
  className,
  deactivateErrorHighlight,
  disabled,
  error: inputError,
  inputDescription,
  inputStyle,
  label,
  name,
  onBlur: handleBlur,
  onChange,
  placeholder,
  resetProps,
  style,
  tabIndex,
  validations,
  value,
  ...rest
}) {
  console.log("wysiwyg rest", { ...rest });
  const [errorInternal, setErrorInternal] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  // this needs to be saved to the database keyed on the post?
  const [blocks, updateBlocks] = useState([]);
  const [articleContent, setArticleContent] = useState({});

  const [blocksFromValue, setBlocksFromValue] = useState([]);
  const [blocksAreRegistered, setBlocksAreRegistered] = useState(false);
  const [mediaLibOpen, setMediaLibOpen] = useState(false);
  const [mediaUploadFn, setMediaUploadFn] = useState(null);

  // this is not how I should be getting the current
  // article id, but I don't know any other way from
  // the frontend ??
  const { pathname } = useLocation();
  const postId = pathname.charAt(pathname.length - 1);

  const getBlockDataFromArticle = () => {
    const CM = getBlocksJSONFieldCodeMirrorInstance();
    if (CM) {
      const blockData = CM.getValue();
      // save the blocks to populate gutenberg editor with
      setArticleContent(JSON.parse(blockData || "[]"));
      setBlocksFromValue(JSON.parse(blockData || "[]"));
    }
  };
  // when we're able to save the blocks data
  // to a separate field, we'll use this
  // to populate gutenberg on init
  useEffect(() => {
    getBlockDataFromArticle();
  }, []);

  const getBlocksJSONFieldCodeMirrorInstance = () => {
    setErrorInternal(null);
    const blocksJSONField = document.querySelector(`#${BLOCKS_FIELD}`);
    if (!blocksJSONField) {
      setErrorInternal(
        `gutenberg-editor: you must have a JSON field titled ${BLOCKS_FIELD} in your content type!`
      );
      return;
    } else {
      const cmEl = blocksJSONField.nextSibling;
      if (cmEl && cmEl.CodeMirror) {
        return cmEl.CodeMirror;
      } else {
        setErrorInternal(
          `gutenberg-editor: wasn't able to get the CodeMirror instance from ${BLOCKS_FIELD}. Please make sure it's a JSON field.`
        );
        return;
      }
    }
  };

  const saveBlockDataToArticle = (b) => {
    // just save to the blocks field via the DOM
    const CM = getBlocksJSONFieldCodeMirrorInstance();
    CM && CM.setValue(JSON.stringify(b));
  };

  console.log(JSON.stringify(blocks));

  useEffect(() => {
    addFilter(
      "editor.MediaUpload",
      "core/edit-post/components/media-upload/replace-media-upload",
      () => ReplaceWPMediaUploader
    );
  }, []);

  const mediaUpload = (data, fn) => {
    console.log("mediaUpload", fn, data);
    // Upload a file somewhere or do something else here

    // Call this at the end to update the block editor
    // This has to be an array
    if (data && data.length > 0) {
      // this just does some WP related shit?
      mediaUploadFn?.onFileChange(data);
      console.log("did media upload");
      // Return the data as an array
      return data;
    }
  };

  const saveHTML = (b) => {
    updateBlocks(b);
    // save the blocks JSON to
    // a 'blocks' field
    // this is a separate JSON type
    // field you need to add to your content type
    saveBlockDataToArticle(b);

    // create the html representation of the content
    // & save to the field via onChange
    const html = b.map((block) => getBlockContent(block));
    const content = html.join("");
    console.log("saving", content);
    onChange({ target: { name, value: content } });
  };

  // buggy way of saving html > parsing back to blocks
  // ideally replace this with saving/getting from the blocks field
  // useEffect(() => {
  //   console.log("vla", value);
  //   if (getBlockTypes().length === 0) return;
  //   const data = rawHandler({ HTML: value });
  //   console.log("data", data);
  //   // setBlocksFromValue(data);
  // }, [blocksAreRegistered]);

  // we need to know when all the Gutenberg
  // blocks have been registered
  useEffect(() => {
    const registered = getBlockTypes();
    console.log("registered on mount", registered);
    if (registered.length === 0) {
      console.log("register blocks");
      registerCoreBlocks();
      setBlocksAreRegistered(true);
    }
  }, []);

  // just dumping this from the gutenberg source
  // so I know what's what.
  /**
   *	Media Upload is used by audio, image, gallery, video, and file blocks to
   *	handle uploading a media file when a file upload button is activated.
   *
   *	TODO: future enhancement to add an upload indicator.
   *
   * @param   {Object}   $0                    Parameters object passed to the function.
   * @param   {?Array}   $0.allowedTypes       Array with the types of media that can be uploaded, if unset all types are allowed.
   * @param   {?Object}  $0.additionalData     Additional data to include in the request.
   * @param   {Array}    $0.filesList          List of files.
   * @param   {?number}  $0.maxUploadFileSize  Maximum upload size in bytes allowed for the site.
   * @param   {Function} $0.onError            Function called when an error happens.
   * @param   {Function} $0.onFileChange       Function called each time a file or a temporary representation of the file is available.
   * @param   {?Object}  $0.wpAllowedMimeTypes List of allowed mime types and file extensions.
   */
  const toggleMediaLib = (e) => {
    console.log("toggleMediaLib", e);
    setMediaLibOpen(!mediaLibOpen);
    // because we've set the mediaUpload
    // callback to be the function
    // that toggles the strapi media uploader,
    // we need to save these parameters to pass them to MediaLib.
    // (specifically onFileChange to add the media after
    // closing the media lib)
    e && setMediaUploadFn(e);
  };

  return (
    <Error
      inputError={inputError}
      name={name}
      type="text"
      validations={validations}
    >
      {({ canCheck, onBlur, error, dispatch }) => {
        const hasError = error && error !== null;

        return isVisible ? (
          <Modal onRequestClose={() => setIsVisible(false)}>
            {/* media lib for 'upload' actions */}
            <MediaLib
              allowedTypes={
                mediaUploadFn?.allowedTypes
                  ? mediaUploadFn?.allowedTypes.map((type) => `${type}s`)
                  : undefined
              }
              multiple={mediaUploadFn?.multiple}
              isOpen={mediaLibOpen}
              onToggle={() => toggleMediaLib(false)}
              onChange={mediaUpload}
              uploadFn={mediaUploadFn}
            />
            <div
              className={`gutenberg-editor ${cn(
                !isEmpty(className) && className
              )} ${hasError ? "bordered" : ""}`}
              style={style}
            >
              <SlotFillProvider>
                <DropZoneProvider>
                  <BlockEditorProvider
                    value={blocks.length > 0 ? blocks : blocksFromValue}
                    onInput={updateBlocks}
                    onChange={saveHTML}
                    settings={{
                      mediaLibrary: true,
                      mediaUpload: toggleMediaLib,
                    }}
                  >
                    <div className="gutenberg-editor__sidebar">
                      <BlockInspector />
                    </div>
                    <div className="editor-styles-wrapper">
                      <Popover.Slot name="block-toolbar" />
                      <BlockEditorKeyboardShortcuts />
                      <WritingFlow>
                        <ObserveTyping>
                          <BlockList />
                        </ObserveTyping>
                      </WritingFlow>
                    </div>
                    <Popover.Slot />
                  </BlockEditorProvider>
                </DropZoneProvider>
              </SlotFillProvider>
            </div>
          </Modal>
        ) : (
          <div class="gutenberg-editor-plugin__default">
            <Label htmlFor={name}>{label}</Label>

            <Button
              disabled={errorInternal}
              isLarge
              isPrimary
              onClick={() => setIsVisible(true)}
            >
              Open Gutenberg Editor
            </Button>
            {!hasError && inputDescription && (
              <Description>{inputDescription}</Description>
            )}
            {hasError && <ErrorMessage>{error}</ErrorMessage>}
            {errorInternal && <ErrorMessage>{errorInternal}</ErrorMessage>}
          </div>
        );
      }}
    </Error>
  );
}

export default WysiwygWithErrors;
