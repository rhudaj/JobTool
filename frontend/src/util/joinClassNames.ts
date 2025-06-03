export const joinClassNames = (className: any, ...classNames: any) => {
    // handle the case where some might be undefined
    const classes = [className]
    classes.push(...classNames)
    return classes.filter((c) => String(c)).join(" ");
}