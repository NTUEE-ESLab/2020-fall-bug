const charWrapperRegex = {
  parentheses: '{([^{}]+)}',
  square_brackets: '\\[([^\\[\\]]+)\\]',
}

type ParseTemplateOption = {
  charWrapper?: keyof typeof charWrapperRegex
  strict?: boolean
}

export type TemplateExecutor<T extends Record<string, string>> = {
  execute(data: T): string
}

export const createTemplateExecutor = <T extends Record<string, string>>(
  template: string = '',
  { charWrapper = 'parentheses', strict = true }: ParseTemplateOption = {},
): TemplateExecutor<T> => {
  const regexp = new RegExp(charWrapperRegex[charWrapper], 'g')
  return {
    execute(data: T) {
      return template.replace(regexp, (_, key) => {
        const replacement = data[key]
        if (!replacement && strict) {
          throw new Error(`missing data for key ${key}`)
        }
        return replacement
      })
    },
  }
}
