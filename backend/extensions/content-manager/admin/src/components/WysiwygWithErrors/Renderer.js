import React from "react";
import { rawHandler, getBlockContent } from "@wordpress/blocks";

const BlockRenderer = ({ blocks }) =>
  blocks.map((block) => {
    // console.log(rawHandler({ HTML: getBlockContent(block) }));
    // console.log("html: ", getBlockContent(block));

    const { name, id, attributes } = block;
    console.log(block);
    switch (name) {
      case "core/paragraph":
        return (
          <p
            key={id}
            dangerouslySetInnerHTML={{ __html: attributes.content }}
          />
        );

      case "core/heading":
        return (
          <h1
            key={id}
            dangerouslySetInnerHTML={{ __html: attributes.content }}
          />
        );

      case "core/image":
        return (
          <figure
            key={id}
            style={{
              width: attributes.width,
              height: attributes.height,
              paddingTop: "2rem",
              paddingBottom: "2rem",
            }}
          >
            <img src={attributes.url} />
            {attributes.caption && (
              <figcaption style={{ textAlign: "center" }}>
                {attributes.caption}
              </figcaption>
            )}
          </figure>
        );
    }
  });

export default Renderer;
