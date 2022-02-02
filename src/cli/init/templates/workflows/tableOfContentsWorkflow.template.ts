import { createFile } from '../../../../utils/files';
import ProjectPath from '../../../../utils/ProjectPath';

const content = `
name: Generate Readme TOC section

on:
  push:
    paths:
      - README.md
      - .github/workflows/table_of_contents.yml

jobs:
  table-of-contents:
    runs-on: ubuntu-latest

    steps:
    - name: Generate table of content
      id: generate
      uses: technote-space/toc-generator@v4
      with:
        GITHUB_TOKEN: \${{secrets.GITHUB_TOKEN}}
        COMMIT_NAME: GitHub Action
        COMMIT_EMAIL: action@github.com
        TOC_TITLE: "# Table of contents"
`.substring(1);

export default function tableOfContentsWorkflowTemplate(projectPath: ProjectPath) {
  createFile(projectPath.tableOfContentsWorkflow, content);
}
