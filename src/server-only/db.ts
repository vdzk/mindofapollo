import chalk from "chalk";
import postgres from "postgres"
import dotenv from "dotenv"

dotenv.config()

// TODO: rename console.log in this file so that it doesn't come up in searches when removing debug code?

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
    },
    date: {
      to: 1082,          // Postgres DATE
      from: [1082],
      parse: (value: string) => value,  // return the raw string
      serialize: (value: string) => value
    }
  }
});

export const printError = (...data: any[]) => console.log(chalk.red('ERROR'), ...data)

export const onError = (error: Error & { [key: string]: any }) => {
  if (error.name === 'PostgresError') {
    console.log()
    if (error.query) {
      console.log(error.query.trim().replaceAll(/\n\s+/g, '\n'))
    }
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
