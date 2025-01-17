import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';

import { FormContextProvider } from '../form/Form';
import OrientationContext from '../../controls/OrientationContext';
import useUniqueId from '../../util/useUniqueId';
import isBool from '../../util/isBool';

const FieldsetBase = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  margin-bottom: 25px;
  width: 100%;

  > *:last-child {
    margin-bottom: 0;
  }

  ${props =>
    props.orientation === 'inline' &&
    css`
      @media (min-width: ${props.theme.screenSize.tablet}) {
        align-items: baseline;
        flex-direction: row;
      }
    `};
`;

const Legend = styled.div`
  color: ${props => props.theme.colors.black};
  flex: 0 0 auto;
  font-size: 21.6px;
  line-height: ${props => props.theme.font.baseLineHeight};
  margin: 0 0 10px 0;
  width: 100%;
`;

function Fieldset(props) {
  const {
    legendContent,
    children,
    orientation: orientationProp,
    flat,
    ...other
  } = props;
  const legendId = useUniqueId();
  const orientation = useContext(OrientationContext);
  const extraFormContext = isBool(flat) ? { flat } : {};
  const finalOrientation = isBool(orientationProp)
    ? orientationProp
    : orientation;

  return (
    <OrientationContext.Provider value={finalOrientation}>
      <FormContextProvider value={extraFormContext}>
        <FieldsetBase
          role="group"
          aria-labelledby={legendId}
          orientation={finalOrientation}
          {...other}
        >
          {legendContent && <Legend id={legendId}>{legendContent}</Legend>}
          {children}
        </FieldsetBase>
      </FormContextProvider>
    </OrientationContext.Provider>
  );
}

Fieldset.propTypes = {
  orientation: PropTypes.oneOf(['stacked', 'inline']),
  /** Determine whether or not to add a legend and what content to display  */
  legendContent: PropTypes.node,
  /** Apply the Flat Style to all children */
  flat: PropTypes.bool,
  children: PropTypes.node
};

Fieldset.defaultProps = {
  orientation: 'stacked',
  legendContent: null,
  flat: undefined,
  children: undefined
};

Fieldset.Legend = Legend;

export default Fieldset;
