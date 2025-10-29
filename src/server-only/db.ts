import chalk from "chalk";
import postgres from "postgres"

// TODO: move config into .env file
export const sql = postgres({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : undefined,
  database: process.env.DB_NAME,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
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
