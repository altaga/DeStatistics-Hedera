// Basic Imports
import React from 'react';

const ContextModule = React.createContext();
class ContextProvider extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: { 
        data:"",
        version1:0,
        version2:0
      },
    };
    this.setValue = this.setValue.bind(this);
  }

  setValue = (value, then = () => { }) => {
    this.setState(
      {
        value: {
          ...this.state.value,
          ...value,
        },
      },
      () => then(),
    );
  };

  render() {
    const { children } = this.props;
    const { value } = this.state;
    const { setValue } = this;
    return (
      <ContextModule.Provider
        value={{
          value,
          setValue,
        }}>
        {children}
      </ContextModule.Provider>
    );
  }
}

export { ContextProvider };
export const ContextConsumer = ContextModule.Consumer;
export default ContextModule;
