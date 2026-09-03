A single-choice group for 2-3 short, mutually exclusive options.

    <Radio defaultValue="course" options={[
      { value: 'course', label: '按课程顺序', hint: '保留讲课的原始脉络' },
      { value: 'concept', label: '按概念聚合' }
    ]} />

Four or more options belong in a Select. onChange hands you the value.
