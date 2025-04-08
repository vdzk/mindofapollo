import chalk from "chalk";
import postgres from "postgres"

// TODO: move config into .env file
export const sql = postgres({
  host: "46.101.91.238",
  port: 5433,
  database: "apollo",
  username: "postgres",
  password: 'hNuC88zc6nue',
  debug: true,
  onnotice: notice => console.log(chalk.green('NOTICE'), notice.message),
  types: {
    numeric: {
      to: 1700, // PG numeric type
      from: [1700],
      serialize: (value: any) => value.toString(),
      parse: (value: string) => parseFloat(value)
    }
  }
});

export const printError = (...data: any[]) => console.log(chalk.red('ERROR'), ...data)

export const onError = (error: Error & { [key: string]: any }) => {
  if (error.name === 'PostgresError') {
    console.log()
    console.log(error.query.trim().replaceAll(/\n\s+/g, '\n'))
    if (error.parameters && error.parameters.length > 0) {
      console.log(error.parameters)
    }
    printError(error.message)
  } else if (error.code === 'UNDEFINED_VALUE') {
    console.log(error)
    printError(error.message)
  } else {
    console.error(error)
  }
  return []
}
