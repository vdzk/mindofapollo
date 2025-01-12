"use server"

import chalk from "chalk";
import postgres from "postgres"

// TODO: move config into .env file
export const sql = postgres({
  host: "localhost",
  port: 5432,
  database: "apollo",
  username: "postgres",
  password: 'jZrZg7aLWkQu',
  debug: true,
  onnotice: notice => console.log(chalk.green('NOTICE'), notice.message),
  // transform: {
  //   ...postgres.camel,
  //   undefined: null
  // }
});

export const onError = (error: Error & {[key: string]: any}) => {
  if (error.name === 'PostgresError') {
    console.log()
    console.log(error.query.trim().replaceAll(/\n\s+/g, '\n'))
    if (error.parameters && error.parameters.length > 0) {
      console.log(error.parameters)
    }
    console.log(chalk.red('ERROR'), error.message)
  } else if (error.code === 'UNDEFINED_VALUE') {
    console.log(error)
    console.log(chalk.red('ERROR'), error.message)
  } else {
    console.error(error)
  }
  return undefined
}
