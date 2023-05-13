#!/usr/bin/env node

import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from 'fs';
import _ from 'lodash';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const fileName = process.argv[2];
const content = fs.readFileSync(path.join(
  __dirname,
  fileName
), 'utf-8');

// BEGIN
const parseLine = (line) => {
  const fields = line.split('|').map((f) => _.trim(f)).slice(1);
  return {
    name: fields[0],
    power: parseInt(fields[1]),
    health: parseInt(fields[2]),
    squadSize: parseInt(fields[3]),
    avgHeight: parseInt(fields[4]),
    avgWeight: parseInt(fields[5]),
    price: parseInt(fields[6]),
  };
};

const squads = content.split(/\r*\n/).slice(1, -1).map((l) => parseLine(l));
console.log(`Squad count: ${squads.length}`);

const sortedByPower = _.orderBy(squads, ['power'], ['desc']);
console.log(`Price for 10 most powerfull: ${sortedByPower.at(0).price * 10}`);
console.log(`Price for 20 second most powerfull: ${sortedByPower.at(1).price * 20}`);

const sortedByWeight = _.orderBy(squads, ['avgWeight']);
const lightest = sortedByWeight.at(0);
const heaviest = sortedByWeight.at(-1);
console.log(`Price for squad of most heavy (${heaviest.name}):  ${heaviest.price * heaviest.squadSize}`);
console.log(`Price for squad of most light (${lightest.name}): ${lightest.price * lightest.squadSize}`);

const squadsWithPowerValueRatio = squads.map((s) => ({ ...s, ratio: s.power / s.price }));
const sortedByPowerValueRatio = _.orderBy(squadsWithPowerValueRatio, ['ratio']);
console.log(`Most profitable unit: ${sortedByPowerValueRatio.at(-1).name}`);
console.log(`Least profitable unit: ${sortedByPowerValueRatio.at(0).name}`);

const moneyLimit = 10000;
const moneyLimitSquads = squads
  .map((s) => ({ ...s, maxAvailable: Math.floor(moneyLimit / s.price) }))
  .map((s) => ({ ...s, totalMoney: s.maxAvailable * s.price, totalPower: s.maxAvailable * s.power }))
  .map((s) => ({ ...s, ratio: s.totalPower / s.totalMoney }));
const sortedMoneyLimit = _.orderBy(moneyLimitSquads, ['ratio']);
const bestMoneyLimit = sortedMoneyLimit.at(-1);
console.log(`Best deal for 10000 is: ${bestMoneyLimit.name} with ${bestMoneyLimit.totalPower} power total for ${bestMoneyLimit.totalMoney}`);
// END