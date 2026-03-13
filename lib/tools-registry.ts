export const TOOL_CATEGORIES = {
    FILE_OPERATIONS: [
        'read_file',
        'create_file_with_contents',
        'edit_file',
        'list_dir',
        'find_files'
    ],
    GITLAB_API: [
        'get_issue',
        'create_issue',
        'get_merge_request',
        'create_merge_request',
        'list_issues'
    ],
    GIT: [
        'git_log',
        'git_diff',
        'git_show'
    ]
};

export const ALL_TOOLS = Object.values(TOOL_CATEGORIES).flat();
