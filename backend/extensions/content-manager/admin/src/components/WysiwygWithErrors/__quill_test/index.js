import React from 'react';
import QuillEditor from './QuillEditor';

import { isEmpty, isFunction } from 'lodash';
import { Description, ErrorMessage, Label } from '@buffetjs/styles';
import { Error } from '@buffetjs/core';
import Wrapper from './Wrapper';
import cn from 'classnames';

class WysiwygWithErrors extends React.Component {

  render() {
    const {
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
    } = this.props;


    return (
      <Error
        inputError={inputError}
        name={name}
        type="text"
        validations={validations}
      >
        {({ canCheck, onBlur, error, dispatch }) => {
          const hasError = error && error !== null;

          return (
            <Wrapper
              className={`${cn(!isEmpty(className) && className)} ${
                hasError ? 'bordered' : ''
                }`}
              style={style}
            >
              <Label htmlFor={name}>{label}</Label>
              <QuillEditor
                autoFocus={autoFocus}
                onChange={onChange}
                name={name}
                value={value}
                disabled={disabled}
                {...rest}
              />

              {!hasError && inputDescription && (
                <Description>{inputDescription}</Description>
              )}
              {hasError && <ErrorMessage>{error}</ErrorMessage>}
            </Wrapper>
          )
        }}
      </Error>
    );
  }
}

export default WysiwygWithErrors;
