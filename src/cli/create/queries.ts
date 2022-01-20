import inquirer from 'inquirer';
import colors from 'colors';
import pluralize from 'pluralize';

import { capitalize } from '../../utils/strings';
import { PrismaModel, PrismaModelAttribute, PrismaModelField, PrismaSchema } from '../../utils/prisma';

/**
 * Prompt the user for the name of the resource to be created
 *
 * @return Resource name (lowercase)
 */
export async function queryResourceName() {
  const { resourceName } = await inquirer.prompt([{
    name: 'resourceName',
    type: 'input',
    message: `How should your new API resource be ${colors.green('named')} ? ${colors.red('(singular)')}`,
    validate: (input) => input !== '' ? true : colors.red('Please enter resource name (example : user)'),
    suffix: '\n❯',
  }]);
  return resourceName.toLowerCase();
}

/**
 * Prompt the user for the plural form of the resource to be created
 * Try first to guess it using grammatical rules
 * If incorrect, let the user write it
 *
 * @param resourceName The singular form of the resource name
 * @return The plural form of the resource name
 */
export async function queryPluralizedResourceName(resourceName: string) {
  const guess = pluralize(resourceName);
  const { isPluralCorrect } = await inquirer.prompt([{
    name: 'isPluralCorrect',
    type: 'list',
    message: `Is '${colors.blue(guess)}' the correct ${colors.green('plural form')} ?`,
    choices: ['Yes', 'No'],
  }]);

  if (isPluralCorrect === 'Yes') {
    return guess.toLowerCase();
  }

  const { pluralizedResourceName } = await inquirer.prompt([{
    name: 'pluralizedResourceName',
    type: 'input',
    message: `Write it in the ${colors.green('plural form')} :`,
    validate: (input) => input !== '' ? true : colors.red('Please enter pluralized form (example : users)'),
    suffix: '\n❯',
  }]);
  return pluralizedResourceName.toLowerCase();
}

/**
 * Prompt the user to know if the model should be stored in database or not
 *
 * @param resourceName Resource name
 * @return True is a data model is needed, false otherwise
 */
export async function queryIfDatabaseModelIsNeeded(resourceName: string) {
  const { isDbModelNeeded } = await inquirer.prompt([{
    name: 'isDbModelNeeded',
    type: 'list',
    message: `Do you need to store ${colors.blue(capitalize(resourceName))} in ${colors.green('database')} ?`,
    choices: ['Yes', 'No'],
  }]);
  return isDbModelNeeded === 'Yes';
}

export async function queryDefaultFields(model: PrismaModel) {
  // Display schema
  console.clear();
  console.log(model.toString());
  console.log();

  const defaultFields = [
    new PrismaModelField('createdAt', 'DateTime', [
      new PrismaModelAttribute('@default', 'now()'),
    ]),
    new PrismaModelField('updatedAt', 'DateTime', [
      new PrismaModelAttribute('@updatedAt'),
    ]),
  ];

  const { selected } = await inquirer.prompt([{
    name: 'selected',
    type: 'checkbox',
    message: `Select default fields to add to ${colors.blue(model.name)}`,
    choices: defaultFields.map((field, index) => ({
      name: field.name,
      value: index,
    })),
  }]);

  for (const index of selected) {
    model.fields.push(defaultFields[index]);
  }
}

export async function queryRelation(schema: PrismaSchema, model: PrismaModel) {
  // Display schema
  console.clear();
  console.log(model.toString());
  console.log();

  const { addRelation } = await inquirer.prompt([{
    name: 'addRelation',
    type: 'list',
    message: `Add ${colors.green('relation')} to ${colors.blue(model.name)} ?`,
    choices: ['Yes', 'No'],
  }]);

  if (addRelation === 'No') {
    return;
  }

  const models = schema.models;
  const { target } = await inquirer.prompt([{
    name: 'target',
    type: 'list',
    message: 'With ?',
    choices: [...models.map((m) => m.name), colors.red('Cancel')],
  }]);

  if (target === colors.red('Cancel')) {
    return;
  }

  await queryRelation(schema, model);
}