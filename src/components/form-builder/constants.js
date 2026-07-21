import {
  Heading, AlignLeft, Type, Hash, AlignJustify,
  Calendar, Clock, CalendarClock, Upload, UserCircle,
  ChevronDown, CheckSquare, Circle, ToggleLeft, MousePointer,
  LayoutList, ListChecks, FileText, GitBranch, Table2, SeparatorHorizontal,
  MapPin, Package,
} from 'lucide-react';

// Short 8-char alphanumeric ID — unique enough for form builder context
export const shortId = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 8; i++) id += chars[(Math.random() * chars.length) | 0];
  return id;
};

export const FIELD_TYPES = [
  { type: 'heading',   label: 'Heading',              icon: Heading,              group: 'fields' },
  { type: 'paragraph', label: 'Paragraph',             icon: AlignLeft,            group: 'fields' },
  { type: 'text',      label: 'Text Field',            icon: Type,                 group: 'fields' },
  { type: 'number',    label: 'Number Input',          icon: Hash,                 group: 'fields' },
  { type: 'textarea',  label: 'Text Area',             icon: AlignJustify,         group: 'fields' },
  { type: 'date',      label: 'Date Picker',           icon: Calendar,             group: 'fields' },
  { type: 'time',      label: 'Time Picker',           icon: Clock,                group: 'fields' },
  { type: 'datetime',  label: 'Date and Time Picker',  icon: CalendarClock,        group: 'fields' },
  { type: 'file',      label: 'File Upload',           icon: Upload,               group: 'fields' },
  { type: 'image',     label: 'Profile Picture',       icon: UserCircle,           group: 'fields' },
  { type: 'dropdown',  label: 'Dropdown',              icon: ChevronDown,          group: 'fields' },
  { type: 'checkbox',  label: 'Checkbox',              icon: CheckSquare,          group: 'fields' },
  { type: 'radio',     label: 'Radio Button',          icon: Circle,               group: 'fields' },
  { type: 'toggle',    label: 'Toggle',                icon: ToggleLeft,           group: 'fields' },
  { type: 'button',    label: 'Button',                icon: MousePointer,         group: 'fields' },
  { type: 'separator', label: 'Separator',             icon: SeparatorHorizontal,  group: 'fields' },

  { type: 'checkbox_group', label: 'Checkbox Group',       icon: ListChecks, group: 'group' },
  { type: 'radio_group',    label: 'Radio Button Group',   icon: LayoutList, group: 'group' },
  { type: 'toc',            label: 'Terms and Conditions', icon: FileText,   group: 'group' },
  { type: 'conditional',    label: 'Conditional Fields',   icon: GitBranch,  group: 'group' },
  { type: 'table',          label: 'Table',                icon: Table2,     group: 'group' },
  { type: 'location',       label: 'Location Picker',      icon: MapPin,     group: 'group' },
  { type: 'asset',          label: 'Asset Picker',         icon: Package,    group: 'group' },
];

// Reverse map: displayInputElementType → frontend type
// Used to restore `type` after a DB round-trip (backend doesn't persist `type`)
export const DISPLAY_INPUT_TO_TYPE = {
  INPUT_BOX:        'text',
  NUMBER:           'number',
  TEXT_AREA:        'textarea',
  SELECT_BOX:       'dropdown',
  RADIO_BUTTON:     'radio',
  RADIO_BUTTON_1:   'radio_group',
  CHECKBOX:         'checkbox_group',
  TOGGLE:           'toggle',
  DATE:             'date',
  TIME:             'time',
  DATE_TIME:        'datetime',
  CONDITIONAL:      'conditional',
  FILE_UPLOAD:      'file',
  IMAGE:            'image',
  SEPARATOR:        'separator',
  ASSET_PICKER:     'asset',
  LOCATION_PICKER:  'location',
};

// Maps our frontend type names to backend displayInputElementType enum values
export const TYPE_TO_DISPLAY_INPUT = {
  text:          'INPUT_BOX',
  number:        'NUMBER',
  textarea:      'TEXT_AREA',
  dropdown:      'SELECT_BOX',
  radio:         'RADIO_BUTTON',
  radio_group:   'RADIO_BUTTON_1',
  checkbox:      'CHECKBOX',
  checkbox_group:'CHECKBOX',
  toggle:        'TOGGLE',
  date:          'DATE',
  time:          'TIME',
  datetime:      'DATE_TIME',
  conditional:   'CONDITIONAL',
  file:          'FILE_UPLOAD',
  image:         'IMAGE',
  separator:     'SEPARATOR',
  asset:         'ASSET_PICKER',
  location:      'LOCATION_PICKER',
  heading:       'INPUT_BOX',
  paragraph:     'INPUT_BOX',
  button:        'INPUT_BOX',
  toc:           'INPUT_BOX',
  conditional:   'SELECT_BOX',
  table:         'INPUT_BOX',
};

// A blank custom component (non-system). displayFiledName is a short random ID.
export const DEFAULT_COMPONENT = (type) => ({
  displayFiledName:       shortId(),
  displayLable:           '',
  displayInputElementType: TYPE_TO_DISPLAY_INPUT[type] ?? 'INPUT_BOX',
  mandatory:              false,
  hidden:                 false,
  width:                  'full',
  type,                   // kept for form builder UI only (not sent to backend as-is)
  config:                 {},
});

export const DEFAULT_CONDITIONAL_SUBFIELD = () => ({
  fieldId:      shortId(),
  label:        '',
  placeholder:  '',
  menuSource:   'custom',
  customValues: [],
  masterSource: '',
  multiSelect:  false,
  dependsOn:    null,
});

// A step now has stepComponents[] (flat, no sections)
export const DEFAULT_STEP = () => ({
  stepId:          shortId(),
  stepName:        '',
  stepDescription: '',
  order:           0,
  stepComponents:  [],
});

// System components injected into the first step on form creation.
// displayFiledName is a meaningful key; systemKey lets the backend extract values.
export const SYSTEM_COMPONENTS = () => [
  {
    displayFiledName:        'mnt_title',
    displayLable:            'Title',
    displayInputElementType: 'INPUT_BOX',
    mandatory:               true,
    hidden:                  false,
    width:                   'full',
    type:                    'text',
    config:                  { placeholder: 'Enter maintenance title' },
    systemField:             true,
    systemKey:               'title',
  },
  {
    displayFiledName:        'mnt_desc',
    displayLable:            'Description',
    displayInputElementType: 'TEXT_AREA',
    mandatory:               false,
    hidden:                  false,
    width:                   'full',
    type:                    'textarea',
    config:                  { placeholder: 'Describe the maintenance work' },
    systemField:             true,
    systemKey:               'description',
  },
  {
    displayFiledName:        'mnt_sched_st',
    displayLable:            'Schedule Start',
    displayInputElementType: 'DATE_TIME',
    mandatory:               true,
    hidden:                  false,
    width:                   'half',
    type:                    'datetime',
    config:                  {},
    systemField:             true,
    systemKey:               'schedule_start',
  },
  {
    displayFiledName:        'mnt_sched_en',
    displayLable:            'Schedule End',
    displayInputElementType: 'DATE_TIME',
    mandatory:               false,
    hidden:                  false,
    width:                   'half',
    type:                    'datetime',
    config:                  {},
    systemField:             true,
    systemKey:               'schedule_end',
  },
  {
    displayFiledName:        'mnt_target',
    displayLable:            'Target',
    displayInputElementType: 'CONDITIONAL',
    mandatory:               true,
    hidden:                  false,
    width:                   'full',
    type:                    'conditional',
    config: {
      subfields: [
        {
          fieldId:      'mnt_loc',
          label:        'Location',
          menuSource:   'masters',
          masterSource: 'locations',
          mandatory:    true,
        },
        {
          fieldId:      'mnt_asset',
          label:        'Asset (optional)',
          menuSource:   'masters',
          masterSource: 'assets',
          dependsOn:    'mnt_loc',
          mandatory:    false,
        },
      ],
    },
    systemField:             true,
    systemKey:               'target',
  },
  {
    displayFiledName:        'mnt_priority',
    displayLable:            'Priority',
    displayInputElementType: 'RADIO_BUTTON_1',
    mandatory:               true,
    hidden:                  false,
    width:                   'full',
    type:                    'radio_group',
    config:                  { options: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], orientation: 'horizontal' },
    systemField:             true,
    systemKey:               'priority',
  },
  {
    displayFiledName:        'mnt_type',
    displayLable:            'Maintenance Type',
    displayInputElementType: 'RADIO_BUTTON_1',
    mandatory:               true,
    hidden:                  false,
    width:                   'full',
    type:                    'radio_group',
    config:                  { options: ['CORRECTIVE', 'PREVENTIVE'], orientation: 'horizontal' },
    systemField:             true,
    systemKey:               'maintenance_type',
  },
];
