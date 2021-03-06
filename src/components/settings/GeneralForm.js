import React from "react";
import { Field, reduxForm } from "redux-form";
import { BwmInput } from "components/shared/form/BwmInput";
import { BwmResError } from 'components/shared/form/BwmResError';
import { required,minLength5, checkSpecialChar,isEmail } from "components/shared/form/validators";
import { connect } from "react-redux";


let GeneralForm = props => {
  const {
    handleSubmit,
    pristine,
    submitting,
    submitCb,
    valid,
    errors
  } = props;

    return (
      <form onSubmit={handleSubmit(submitCb)}>
       <h1>General account Settings</h1>
       <h2>If you change your username you'll be logged out.</h2>
       <BwmResError errors={errors} />
        <Field
            name="username"
            type="text"
            label="username"
            component={BwmInput}
            validate={[required, minLength5, checkSpecialChar]}
            data-parse="lowercase"
        />
        <Field
            name="mail"
            type="text"
            label="mail"
            component={BwmInput}
            validate={[required, isEmail]}
            data-parse="lowercase"
        />
       <div className="form-submit">
          <button
            className="button full"
            type="submit"
            disabled={!valid || pristine || submitting}
          >
            Save Changes
          </button>
        </div>
      </form>
    );
};

GeneralForm= reduxForm({
  form: "generalForm"
})(GeneralForm);

GeneralForm = connect(store => ({
  initialValues: store.user.data[0]
}))(GeneralForm);

export default GeneralForm;
