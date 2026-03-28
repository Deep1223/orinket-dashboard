'use client';

import {TextRenderField, DropdownRenderField, CheckboxRenderField, TextareaRenderField, HtmlEditorRenderField, DatePickerRenderField, ImageRenderField, MultipleImageRenderField, ColorPickerRenderField, TableAddButtonRenderField, PasswordRenderField, RadioRenderField, DefaultRenderField} from './index';

const RenderViewField = (props) => {
  const { field, viewDetails, handlePreview } = props;

  if (field.istablefield) return null;

  if (field.type === 'text') {
    return <TextRenderField field={field} viewDetails={viewDetails} />;
  }

  if (field.type === 'dropdown') {
    return <DropdownRenderField field={field} viewDetails={viewDetails} />;
  }

  if (field.type === 'checkbox') {
    return <CheckboxRenderField field={field} viewDetails={viewDetails} />;
  }

  if (field.type === 'radio') {
    return <RadioRenderField field={field} viewDetails={viewDetails} />;
  }

  if (field.type === 'textarea') {
    return <TextareaRenderField field={field} viewDetails={viewDetails} />;
  }

  if (field.type === 'html-editor') {
    return <HtmlEditorRenderField field={field} viewDetails={viewDetails} />;
  }

  if (field.type === 'datepicker') {
    return <DatePickerRenderField field={field} viewDetails={viewDetails} />;
  }

  if (field.type === 'image') {
    return <ImageRenderField field={field} viewDetails={viewDetails} handlePreview={handlePreview} />;
  }

  if (field.type === 'multipleimage') {
    return <MultipleImageRenderField field={field} viewDetails={viewDetails} handlePreview={handlePreview} />;
  }

  if (field.type === 'tbl-add-button') {
    return <TableAddButtonRenderField field={field} viewDetails={viewDetails} />;
  }

  if (field.type === 'colorpicker') {
    return <ColorPickerRenderField field={field} viewDetails={viewDetails} />;
  }

  if (field.type === 'password') {
    return <PasswordRenderField field={field} viewDetails={viewDetails} />;
  }

  return <DefaultRenderField field={field} viewDetails={viewDetails} />;
};

export default RenderViewField;

