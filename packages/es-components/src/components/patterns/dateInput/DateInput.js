import 'get-root-node-polyfill/implement';
import React, { useEffect, useReducer, useRef } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { isBefore, isAfter } from 'date-fns';
import { noop } from 'lodash';

import Day from './Day';
import Month from './Month';
import Year from './Year';

const Wrapper = styled.div`
  display: flex;

  && > * {
    margin-right: 2px;
  }

  @media (min-width: ${props => props.theme.screenSize.tablet}) {
    max-width: 350px;
  }
`;

function cleanZeroes(day) {
  let cleanDay = day;
  while (cleanDay.charAt(0) === '0') {
    cleanDay = cleanDay.substr(1);
  }
  return cleanDay;
}

function reducer(state, action) {
  switch (action.type) {
    case 'day_updated':
      return { ...state, day: action.value };
    case 'month_updated':
      return { ...state, month: action.value };
    case 'year_updated':
      return { ...state, year: action.value };
    default:
      throw new Error();
  }
}

function DateInput({
  children,
  defaultValue,
  defaultDay,
  id,
  maxDate,
  minDate,
  onBlur,
  onChange,
  ...props
}) {
  const [state, dispatch] = useReducer(reducer, {
    day: defaultValue ? defaultValue.getDate() : defaultDay,
    month: defaultValue ? defaultValue.getMonth() + 1 : '',
    year: defaultValue ? defaultValue.getFullYear().toString() : ''
  });

  const hasDayElement = useRef(false);

  useEffect(() => {
    React.Children.forEach(children, child => {
      if (child.type === Month && !state.month) {
        if (child.props.selectOptionText) {
          dispatch({ type: 'month_updated', value: 'none' });
        }
      }
      if (child.type === Day) {
        hasDayElement.current = true;
      }
    });
  }, [children, state.month]);

  function createDate(year, month, day) {
    const cleanDay = day ? cleanZeroes(day.toString()) : day;
    const date = new Date(`${year}/${month}/${cleanDay}`);
    const dateIsValid =
      month !== 'none' &&
      year.length === 4 &&
      (hasDayElement.current ? date.getDate().toString() === cleanDay : true) &&
      (month ? (date.getMonth() + 1).toString() === month.toString() : true) &&
      date.getFullYear().toString() === year.toString();

    const isInRange =
      dateIsValid &&
      (minDate ? isAfter(date, minDate) : true) &&
      (maxDate ? isBefore(date, maxDate) : true);
    return {
      value: dateIsValid ? date : undefined,
      isInRange,
      rawValues: {
        year: year.toString(),
        month: month === 'none' ? '' : month.toString(),
        day: day.toString()
      }
    };
  }

  function onChangeDatePart(datePart, value) {
    switch (datePart) {
      case 'day':
        onChange(createDate(state.year, state.month, value));
        dispatch({
          type: 'day_updated',
          value
        });
        return;
      case 'month':
        onChange(createDate(state.year, value, state.day));
        dispatch({ type: 'month_updated', value });
        return;
      case 'year':
        onChange(createDate(value, state.month, state.day));
        dispatch({
          type: 'year_updated',
          value
        });
        return;
      default:
        throw new Error();
    }
  }

  function onBlurComponent(event) {
    const target = event.currentTarget;
    setTimeout(() => {
      if (!target.contains(target.getRootNode().activeElement)) {
        onBlur(event);
      }
    }, 0);
  }

  return (
    <Wrapper tabIndex="-1" {...props} onBlur={onBlurComponent}>
      {React.Children.map(children, (child, index) =>
        index === 0
          ? React.cloneElement(child, {
              id,
              onChange: onChangeDatePart,
              date: createDate(state.year, state.month, state.day).value
            })
          : React.cloneElement(child, {
              onChange: onChangeDatePart,
              date: createDate(state.year, state.month, state.day).value
            })
      )}
    </Wrapper>
  );
}

DateInput.propTypes = {
  id: PropTypes.string,
  children: PropTypes.node.isRequired,
  /** set the minimum valid date */
  maxDate: PropTypes.instanceOf(Date),
  /** set the maximum valid date */
  minDate: PropTypes.instanceOf(Date),
  /** returns an object (value, isInRange) */
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  /** set the Date value of the component */
  defaultValue: PropTypes.instanceOf(Date),
  /** Set the default day of the month */
  defaultDay: PropTypes.string
};

DateInput.defaultProps = {
  id: undefined,
  maxDate: undefined,
  minDate: undefined,
  defaultValue: undefined,
  defaultDay: '',
  onBlur: noop
};

DateInput.Day = Day;
DateInput.Month = Month;
DateInput.Year = Year;

export default DateInput;
