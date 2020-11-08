#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require("fs");
const path = require("path");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const { default: byteParser } = require("byte-parser");
const Trunc = require("truncating-stream");
const makeDir = require("make-dir");
const dasherTransform = require("./lib/dasher");

const INPUT_DATA_PATH = path.join(__dirname, "./raw.txt");
const DASHER_OUTPUT_PATH = path.join(__dirname, "apps/dasher.txt");

yargs(hideBin(process.argv))
  .command(
    "dasher [size]",
    "build a dataset for Dasher",
    (yargs) => {
      yargs.positional("size", {
        describe: "size of file to generate (ex. 5MB)",
        default: "5MB",
      });
    },
    async (argv) => {
      const size = byteParser(argv.size);
      const trunc = new Trunc({ limit: size });

      await makeDir(path.join(__dirname, "apps"));

      fs.createReadStream(INPUT_DATA_PATH)
        .pipe(trunc)
        .pipe(dasherTransform)
        .pipe(fs.createWriteStream(DASHER_OUTPUT_PATH));
    }
  )
  .command(
    "clear",
    "delete all locally generated datasets",
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    () => {},
    async () => {
      await fs.promises.rm(DASHER_OUTPUT_PATH);
    }
  ).argv;