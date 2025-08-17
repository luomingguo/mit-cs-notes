---
layout: page
---
<script setup>
    
import {
    VPTeamPage,
    VPTeamPageTitle,
    VPTeamMembers
} from 'vitepress/theme'

const members = [
    {
        avatar: "",
        name: ""
    }
]

</script>

<VPTeamPage>
    <VPTeamPageTitle>
        <template #title>
            Our team
        </template>
        <template #lead>
            Ron(Luo Mingguo)
        </template>
    </VPTeamPageTitle
        :members="members"
    />
</VPTeamPage>

