import React from 'react'
import Autosuggest, { defaultProps } from 'material-ui-autosuggest'
import { withStyles } from 'material-ui/styles'

// array of countries formatted like `{"label": "United States", "abbr": "US"}`

const styles = {
    autosuggest: {
        /* your styles */
    }
}

const AppFilter = ({
    helperText, // 'Enter your country (name or abbreviation)'
    label, // 'Country'
    labelKey, // 'label'
    fullWidth, // true
    error, // false
    renderSuggestionProps, // [object Object]
    selectClosestMatch, // false
    suggestionLimit, // 5
    classes, // classes generated from the `withStyles` HOC
    suggestions,
    ...props // other props
}) => (
    <Autosuggest
        helperText={helperText}
        label={label}
        labelKey={labelKey}
        fullWidth={fullWidth}
        error={error}
        renderSuggestionProps={renderSuggestionProps}
        selectClosestMatch={selectClosestMatch}
        suggestionLimit={suggestionLimit}
        suggestions={suggestions}
        fuzzySearchOpts={{
            ...defaultProps.fuzzySearchOpts,
            keys: ['label', 'abbr']
        }}
        className={classes.autosuggest}
        {...props}
    />
)

AppFilter.propTypes = { /* your proptypes */ }

export default withStyles(styles)(AppFilter)
